type DeviceType = 'KB-1' | 'CA-100' | 'TP-1' | 'CP-1';
type DeviceTypeAlias = 'KB1' | 'CA1' | 'TP1' | 'CP1';

type VerificationKeyType = 'vrf-pns' | 'vrf-mic' | 'vrf-chrg' | 'vrf-cuff' | 'vrf-orm'

interface VerificationResultType {
  pass: true | false | null;
  description: string;
}
interface VerificationItem {
  name: string;
  key: VerificationKeyType;
  action?: () => void;
}
type VerificationValuesType = Record<VerificationKeyType, VerificationResultType>;