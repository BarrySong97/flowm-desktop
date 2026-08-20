/**
 * @purpose Bootstrap the Tauri shell and proxy narrow data commands to the Node sidecar.
 * @role    Rust composition root and private newline-delimited JSON process transport.
 * @deps    Tauri commands, serde_json, and the bundled FlowM Node sidecar.
 * @gotcha  Sidecar stdout is a private line-delimited JSON protocol; stderr is diagnostic only.
 */
use serde_json::{json, Value};
use std::{
    fs,
    sync::{
        mpsc::{self, Receiver},
        Arc, Mutex,
    },
};
use tauri::{Manager, State};
use tauri_plugin_shell::{
    process::{CommandChild, CommandEvent},
    ShellExt,
};

struct SidecarProcess {
    child: Option<CommandChild>,
    messages: Receiver<Result<Value, String>>,
    next_id: u64,
}

impl SidecarProcess {
    fn start(app: &tauri::AppHandle) -> Result<Self, String> {
        let resource_dir = app
            .path()
            .resource_dir()
            .map_err(|error| format!("Failed to resolve FlowM resource directory: {error}"))?;
        let migrations = resource_dir.join("migrations");
        let resources = resource_dir.join("resources");
        let user_data = app
            .path()
            .app_data_dir()
            .map_err(|error| format!("Failed to resolve FlowM app data directory: {error}"))?;
        let native_cache = user_data.join("sidecar-native-cache");

        fs::create_dir_all(&user_data)
            .map_err(|error| format!("Failed to create FlowM app data directory: {error}"))?;
        fs::create_dir_all(&native_cache)
            .map_err(|error| format!("Failed to create FlowM sidecar cache directory: {error}"))?;

        for required_path in [&migrations, &resources] {
            if !required_path.exists() {
                return Err(format!(
                    "Missing bundled FlowM resource: {}",
                    required_path.display()
                ));
            }
        }

        let command = app
            .shell()
            .sidecar("flowm-sidecar")
            .map_err(|error| format!("Failed to resolve FlowM data sidecar: {error}"))?
            .current_dir(&resource_dir)
            .env("FLOWM_SIDECAR_USER_DATA_DIR", &user_data)
            .env("FLOWM_SIDECAR_MIGRATIONS_DIR", &migrations)
            .env("FLOWM_SIDECAR_RESOURCES_DIR", &resources)
            .env("PKG_NATIVE_CACHE_PATH", &native_cache);
        let (mut events, child) = command
            .spawn()
            .map_err(|error| format!("Failed to start FlowM data sidecar: {error}"))?;

        let (message_sender, messages) = mpsc::channel();
        tauri::async_runtime::spawn(async move {
            while let Some(event) = events.recv().await {
                match event {
                    CommandEvent::Stdout(bytes) => {
                        let value = serde_json::from_slice(&bytes).map_err(|error| {
                            format!("FlowM data sidecar returned invalid JSON: {error}")
                        });
                        if message_sender.send(value).is_err() {
                            break;
                        }
                    }
                    CommandEvent::Stderr(bytes) => {
                        eprintln!(
                            "[flowm-sidecar] {}",
                            String::from_utf8_lossy(&bytes).trim_end()
                        );
                    }
                    CommandEvent::Error(error) => {
                        let _ = message_sender.send(Err(format!(
                            "FlowM data sidecar stream failed: {error}"
                        )));
                        break;
                    }
                    CommandEvent::Terminated(payload) => {
                        let _ = message_sender.send(Err(format!(
                            "FlowM data sidecar exited unexpectedly (code {:?})",
                            payload.code
                        )));
                        break;
                    }
                    _ => {}
                }
            }
        });

        let mut process = Self {
            child: Some(child),
            messages,
            next_id: 0,
        };

        let ready = process.read_message()?;
        if ready.get("kind").and_then(Value::as_str) != Some("ready") {
            let message = ready
                .pointer("/error/message")
                .and_then(Value::as_str)
                .unwrap_or("FlowM data sidecar did not report ready");
            return Err(message.to_string());
        }

        Ok(process)
    }

    fn read_message(&mut self) -> Result<Value, String> {
        self.messages
            .recv()
            .map_err(|_| "FlowM data sidecar message channel closed".to_string())?
    }

    fn request(&mut self, action: &str, payload: Option<Value>) -> Result<Value, String> {
        self.next_id += 1;
        let id = self.next_id;
        let message = json!({ "id": id, "action": action, "payload": payload });
        let mut bytes = serde_json::to_vec(&message)
            .map_err(|error| format!("Failed encoding FlowM sidecar request: {error}"))?;
        bytes.push(b'\n');
        self.child
            .as_mut()
            .ok_or_else(|| "FlowM data sidecar is not running".to_string())?
            .write(&bytes)
            .map_err(|error| format!("Failed writing FlowM data sidecar: {error}"))?;

        let response = self.read_message()?;
        if response.get("id").and_then(Value::as_u64) != Some(id) {
            return Err("FlowM data sidecar response id did not match its request".to_string());
        }
        if response.get("ok").and_then(Value::as_bool) == Some(true) {
            return Ok(response.get("data").cloned().unwrap_or(Value::Null));
        }
        Err(response
            .pointer("/error/message")
            .and_then(Value::as_str)
            .unwrap_or("FlowM data sidecar request failed")
            .to_string())
    }
}

impl Drop for SidecarProcess {
    fn drop(&mut self) {
        if let Some(child) = self.child.take() {
            let _ = child.kill();
        }
    }
}

#[derive(Clone)]
struct SidecarState {
    process: Arc<Mutex<SidecarProcess>>,
}

impl SidecarState {
    async fn request(&self, action: &'static str, payload: Option<Value>) -> Result<Value, String> {
        let process = Arc::clone(&self.process);
        tauri::async_runtime::spawn_blocking(move || {
            process
                .lock()
                .map_err(|_| "FlowM data sidecar lock was poisoned".to_string())?
                .request(action, payload)
        })
        .await
        .map_err(|error| format!("FlowM sidecar task failed: {error}"))?
    }
}

#[tauri::command]
async fn trpc_request(state: State<'_, SidecarState>, request: Value) -> Result<Value, String> {
    state.request("trpc", Some(request)).await
}

#[tauri::command]
async fn get_database_path(state: State<'_, SidecarState>) -> Result<Option<String>, String> {
    let value = state.request("databasePath", None).await?;
    serde_json::from_value(value)
        .map_err(|error| format!("FlowM sidecar returned an invalid database path: {error}"))
}

#[tauri::command]
async fn database_exists(state: State<'_, SidecarState>) -> Result<bool, String> {
    let value = state.request("databaseExists", None).await?;
    serde_json::from_value(value)
        .map_err(|error| format!("FlowM sidecar returned an invalid database status: {error}"))
}

#[tauri::command]
async fn drain_ledger_changes(state: State<'_, SidecarState>) -> Result<Value, String> {
    state.request("drainLedgerChanges", None).await
}

#[tauri::command]
async fn import_ledger(state: State<'_, SidecarState>, path: String) -> Result<Value, String> {
    state
        .request("importLedger", Some(Value::String(path)))
        .await
}

#[tauri::command]
async fn ledger_path(state: State<'_, SidecarState>, id: String) -> Result<String, String> {
    let value = state.request("ledgerPath", Some(Value::String(id))).await?;
    serde_json::from_value(value)
        .map_err(|error| format!("FlowM sidecar returned an invalid ledger path: {error}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let process = SidecarProcess::start(app.handle())?;
            app.manage(SidecarState {
                process: Arc::new(Mutex::new(process)),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            trpc_request,
            get_database_path,
            database_exists,
            drain_ledger_changes,
            import_ledger,
            ledger_path
        ])
        .run(tauri::generate_context!())
        .expect("failed to run FlowM Tauri application");
}
