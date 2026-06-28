/*
 * @purpose Formatting helpers for the read-only mobile mock UI.
 * @role    Mirrors the reference TypeScript formatter behavior in Dart.
 * @deps    Dart core only.
 * @gotcha  Keep display formatting separate from future synced domain values.
 */
String fmt(num value, {int decimals = 0}) {
  final fixed = value.toStringAsFixed(decimals);
  final parts = fixed.split('.');
  final whole = parts.first.replaceAllMapped(
    RegExp(r'\B(?=(\d{3})+(?!\d))'),
    (_) => ',',
  );
  return parts.length == 1 ? whole : '$whole.${parts[1]}';
}

String money(num value, {int decimals = 0}) =>
    '¥${fmt(value, decimals: decimals)}';

String signedMoney(num value) {
  final prefix = value >= 0 ? '+¥' : '-¥';
  return '$prefix${fmt(value.abs())}';
}

String compact(num value) {
  if (value.abs() >= 10000) {
    return '${fmt(value / 10000, decimals: 1)}万';
  }
  return fmt(value);
}
