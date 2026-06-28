/*
 * @purpose Flowm mobile design tokens translated from the reference UI.
 * @role    Provides shared colors, text styles, and Material theme setup.
 * @deps    Flutter Material only.
 * @gotcha  Keep these values aligned with the Desktop-derived mobile reference.
 */
import 'package:flutter/material.dart';

final ThemeData flowmTheme = ThemeData(
  colorScheme: ColorScheme.fromSeed(
    seedColor: FlowmColors.accent,
    surface: FlowmColors.surface,
  ),
  scaffoldBackgroundColor: FlowmColors.surface,
  fontFamily: '.SF Pro Text',
  useMaterial3: true,
  textTheme: const TextTheme(
    headlineMedium: TextStyle(
      color: FlowmColors.ink,
      fontSize: 30,
      height: 1.12,
      fontWeight: FontWeight.w700,
    ),
    titleLarge: TextStyle(
      color: FlowmColors.ink,
      fontSize: 19,
      height: 1.2,
      fontWeight: FontWeight.w700,
    ),
    titleMedium: TextStyle(
      color: FlowmColors.ink,
      fontSize: 14,
      height: 1.25,
      fontWeight: FontWeight.w600,
    ),
    bodyMedium: TextStyle(
      color: FlowmColors.ink2,
      fontSize: 13,
      height: 1.45,
      fontWeight: FontWeight.w400,
    ),
    bodySmall: TextStyle(
      color: FlowmColors.ink3,
      fontSize: 11.5,
      height: 1.35,
      fontWeight: FontWeight.w400,
    ),
  ),
);

abstract final class FlowmColors {
  static const bg = Color(0xFFEBEEEA);
  static const surface = Color(0xFFFFFFFF);
  static const surface2 = Color(0xFFF7F9F7);
  static const surface3 = Color(0xFFF1F4F1);

  static const ink = Color(0xFF161E19);
  static const ink2 = Color(0xFF58625B);
  static const ink3 = Color(0xFF8A948C);
  static const ink4 = Color(0xFFB3BBB4);
  static const ink5 = Color(0xFFD3D9D3);

  static const hair = Color(0xFFE6EAE6);
  static const hair2 = Color(0xFFEEF1EE);
  static const hair3 = Color(0xFFF3F5F3);

  static const accent = Color(0xFF14794A);
  static const accent2 = Color(0xFF178A52);
  static const accentSoft = Color(0xFFE7F3EB);
  static const accentLine = Color(0xFFC8E4D2);

  static const red = Color(0xFFB8412F);
  static const redSoft = Color(0xFFF9ECE8);
  static const amber = Color(0xFFAD7C2C);
  static const amberSoft = Color(0xFFF6EFE1);

  static const live = Color(0xFFA9763F);
  static const food = Color(0xFFC2873B);
  static const transport = Color(0xFF4A7FB5);
  static const shopping = Color(0xFF8A6DB5);
  static const subscription = Color(0xFF3D9D8F);
  static const fun = Color(0xFFBD6493);
  static const invest = Color(0xFF2A8D5B);
  static const income = Color(0xFF14794A);
  static const other = Color(0xFF8B918D);
  static const transfer = Color(0xFF6B8FA5);
}

abstract final class FlowmSpacing {
  static const none = 0.0;
  static const xxs = 2.0;
  static const xs = 4.0;
  static const sm = 6.0;
  static const md = 8.0;
  static const lg = 10.0;
  static const xl = 12.0;
  static const xxl = 14.0;
  static const xxxl = 16.0;
  static const sectionGap = 18.0;
  static const pageX = 20.0;

  static const pageHeaderPadding = EdgeInsets.fromLTRB(20, 8, 20, 14);
  static const sectionPadding = EdgeInsets.fromLTRB(20, 18, 20, 18);
  static const heroPadding = EdgeInsets.fromLTRB(20, 4, 20, 18);
  static const heroPaddingLarge = EdgeInsets.fromLTRB(20, 4, 20, 20);
  static const listPadding = EdgeInsets.fromLTRB(20, 6, 20, 0);
  static const infoPadding = EdgeInsets.fromLTRB(20, 10, 20, 18);
}

abstract final class FlowmRadius {
  static const xxs = 2.0;
  static const xs = 5.0;
  static const sm = 8.0;
  static const md = 10.0;
  static const lg = 11.0;
  static const xl = 14.0;
  static const pill = 100.0;
}

abstract final class FlowmSizes {
  static const mobileBottomPadding = 104.0;
  static const detailBottomPadding = 34.0;
  static const sectionDivider = 8.0;
  static const iconButton = 34.0;
  static const chevron = 16.0;
  static const colorDot = 9.0;
  static const miniColorDot = 7.0;
  static const profileAvatar = 48.0;
  static const profileMetricIcon = 34.0;
  static const progress = 8.0;
  static const progressDense = 7.0;
  static const categoryProgress = 6.0;
  static const sparklineWidth = 150.0;
  static const sparklineHeight = 38.0;
  static const dayBarsHeight = 54.0;
  static const monthBarsHeight = 148.0;
  static const budgetBarsHeight = 118.0;
}

abstract final class FlowmTextStyles {
  static const sectionTitle = TextStyle(
    color: FlowmColors.ink,
    fontSize: 13,
    fontWeight: FontWeight.w600,
  );

  static const sectionMeta = TextStyle(color: FlowmColors.ink4, fontSize: 11.5);

  static const rowTitle = TextStyle(color: FlowmColors.ink, fontSize: 13.5);

  static const rowTitleStrong = TextStyle(
    color: FlowmColors.ink,
    fontSize: 14,
    fontWeight: FontWeight.w600,
  );

  static const rowMeta = TextStyle(color: FlowmColors.ink3, fontSize: 10.5);

  static const bodyMeta = TextStyle(color: FlowmColors.ink3, fontSize: 11.5);

  static const groupLabel = TextStyle(
    color: FlowmColors.ink4,
    fontSize: 10.5,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
  );

  static const kicker = TextStyle(
    color: FlowmColors.ink4,
    fontSize: 10,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
  );

  static const tabLabel = TextStyle(fontSize: 10, fontWeight: FontWeight.w500);
}

const monoFeatures = [FontFeature.tabularFigures(), FontFeature.slashedZero()];

TextStyle monoStyle({
  double size = 13,
  FontWeight weight = FontWeight.w500,
  Color color = FlowmColors.ink,
}) {
  return TextStyle(
    color: color,
    fontSize: size,
    fontWeight: weight,
    fontFeatures: monoFeatures,
    letterSpacing: 0,
  );
}
