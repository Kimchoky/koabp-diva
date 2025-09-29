/**
 * 0~999999 범위의 숫자를 3바이트 BCD(Binary-Coded Decimal) 형식의 배열로 변환합니다.
 * 각 두 자리 숫자는 하나의 바이트 값으로 직접 매핑됩니다.
 *
 * @param hexValue - 변환할 Hex [0-9a-fA-F]
 * @returns [hi, mid, low] 형식의 3바이트 숫자 배열.
 * @throws 입력값이 유효한 범위(0-999999)의 정수가 아닐 경우 에러를 발생시킵니다.
 *
 * @example
 * // 999999 -> [0x99, 0x99, 0x99]
 * numberToBcdBytes(999999); // [153, 153, 153]
 *
 * @example
 * // 64 -> "000064" -> [0x00, 0x00, 0x64]
 * numberToBcdBytes(64); // [0, 0, 100]
 *
 * @example
 * // 100 -> "000100" -> [0x00, 0x01, 0x00]
 * numberToBcdBytes(100); // [0, 1, 0]
 *
 * @example
 * // 123456 -> [0x12, 0x34, 0x56]
 * numberToBcdBytes(123456); // [18, 52, 86]
 */
export function hexToBcdBytes(hexValue: string): number[] {
  // 입력값 검증: 16진수 문자열이어야 하고, 최대 6자리
  if (typeof hexValue !== 'string' || !/^[0-9A-Fa-f]*$/.test(hexValue)) {
    console.log('hexValue : ', hexValue);
    throw new Error('입력값은 16진수 문자열이어야 합니다 (0-9, A-F).');
  }

  if (hexValue.length > 6) {
    throw new Error('입력값은 최대 6자리 16진수여야 합니다.');
  }

  // 6자리로 패딩 (앞을 0으로 채움)
  const paddedHex = hexValue.toUpperCase().padStart(6, '0');

  // 각 2자리 부분을 16진수로 해석하여 바이트로 변환
  const hi = parseInt(paddedHex.substring(0, 2), 16);
  const mid = parseInt(paddedHex.substring(2, 4), 16);
  const low = parseInt(paddedHex.substring(4, 6), 16);

  return [hi, mid, low];
}
