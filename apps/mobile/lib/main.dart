/*
 * @purpose Flowm mobile app entry point.
 * @role    Boots the read-only Flutter mobile shell.
 * @deps    flowm_mobile_app.dart.
 * @gotcha  Mobile is display-only; do not add local create/update/delete flows.
 */
import 'package:flutter/material.dart';

import 'src/flowm_mobile_app.dart';

void main() {
  runApp(const FlowmMobileApp());
}
