/*
 * @purpose Seed a Desktop SQLite fixture into the mobile app sandbox.
 * @role    Copies the bundled Flowm demo ledger asset to simulator/device app support.
 * @deps    Flutter asset bundle, path, path_provider.
 * @gotcha  This is development fixture seeding only; mobile still opens the ledger read-only.
 */
import 'dart:io';

import 'package:flutter/services.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

const bundledDemoLedgerAsset = 'assets/flowm-demo.sqlite3';
const simulatorLedgerFileName = 'flowm-demo.sqlite3';

Future<File> seedBundledDemoLedger({bool force = true}) async {
  final dir = await getApplicationSupportDirectory();
  if (!await dir.exists()) {
    await dir.create(recursive: true);
  }

  final target = File(p.join(dir.path, simulatorLedgerFileName));
  if (!force && await target.exists()) {
    return target;
  }

  final bytes = await rootBundle.load(bundledDemoLedgerAsset);
  final view = bytes.buffer.asUint8List(
    bytes.offsetInBytes,
    bytes.lengthInBytes,
  );
  await target.writeAsBytes(view, flush: true);
  return target;
}
