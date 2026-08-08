/**
 * @purpose Launch the Flowm Tauri desktop library on native platforms.
 * @role    Minimal binary entry point required by Cargo and the Tauri CLI.
 * @deps    flowm_lib.
 * @gotcha  Keep application setup in lib.rs so future mobile entry points can reuse it.
 */

fn main() {
    flowm_lib::run();
}
