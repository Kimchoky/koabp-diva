import crypto from 'crypto'

/**
 * 암호학적으로 안전한 난수를 생성하여 지정된 범위 내의 정수를 반환함
 * @param min - 최소값 (포함)
 * @param max - 최대값 (포함)
 * @returns min과 max 사이의 랜덤 정수
 */
export function getSecureRandomInt(min: number, max: number): number {
  const range = max - min + 1
  const randomBytes = crypto.randomBytes(4) // 32-bit integer
  const randomNumber = randomBytes.readUInt32BE(0)
  return min + (randomNumber % range)
}
