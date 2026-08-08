/**
 * @purpose Generate Tauri build metadata for the Flowm desktop binary.
 * @role    Cargo build script for the parallel Tauri shell.
 * @deps    tauri-build.
 * @gotcha  Keep runtime behavior in src/lib.rs rather than this build step.
 */

fn main() {
    tauri_build::build()
}
