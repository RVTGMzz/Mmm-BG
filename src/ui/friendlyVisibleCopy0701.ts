/**
 * 0.1.70.1 visible-copy policy.
 *
 * Authority/content can keep protocol vocabulary. Every user-facing surface routes
 * copy through this helper so legacy technical/opponent wording cannot leak back in.
 */
export function friendlyVisibleCopy0701(value: string): string {
  return value
    .replaceAll('ĐỐI THỦ', 'NGƯỜI CHƠI KHÁC')
    .replaceAll('Đối thủ', 'Người chơi khác')
    .replaceAll('đối thủ', 'người chơi khác')
    .replaceAll('TARGET', 'NGƯỜI CHƠI ĐƯỢC CHỌN')
    .replaceAll('Target', 'Người chơi được chọn')
    .replaceAll('target', 'người chơi được chọn');
}
