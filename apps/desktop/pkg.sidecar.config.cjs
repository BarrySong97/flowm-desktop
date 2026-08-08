/**
 * @purpose Configure the self-contained Node binary used as FlowM's Tauri data sidecar.
 * @role    pkg asset declaration for the dynamically loaded better-sqlite3 native binding.
 * @deps    @yao-pkg/pkg and the Node-ABI better-sqlite3 artifact installed by pnpm.
 * @gotcha  The pkg Node major must match the ABI used to install better-sqlite3.
 */

module.exports = {
  assets: ["node_modules/better-sqlite3/build/Release/better_sqlite3.node"],
  bytecode: false,
  public: true,
  publicPackages: "*",
}
