import { MusicTrack } from "../../types";
import { toTime } from "../../utils";
import { challengeLevel } from "./_challengeLevel";

const name = 'casa';

export const X_CASA = challengeLevel({
  id: 'X403',
  name,
  parTime: toTime({ minutes: 0, seconds: 35 }),
  layoutV2: `Cm1tTExpbUtVWGRkZGRkZGRkbFhWZlZYV2RBdHR0Vm8nV2RQU28talNuTGRBUC1aWlNYVmYnbkxkUFBtWC1LKUxkQXBWcWRQUHFkQVNBVktmSktxWFNBWEFTcnlYPU1neHd3TClsT3hBd2dMKWxybFhNaCpsckxQTz0tISFobkxQckxQWHdNKnlyWFZBWEFTbUtPS1cnQVAtX2wnVnV6bCdTX0xwU21pKFVMYkxiWHRwVmRRWC1acFNkUVhiS1hMaWZMaVhRfDQ2NXxSSUdIVHxDYXNhdjIwMDAwfDUzY2N8MHwwLjY0fCNFRkQ5Q0VORTFCN0EzZThGMzk4NU5BMDQwOTVrZTM2M0E1OWtOMDdCRUI4TjA4RDlEMk43OEQ1RTNONDVDNUQ5Tjk4REZFQXxZWVkxfDdoPT0nU1MoICApIAoqPVhPIW5LZlhnQU4tI09YISFwJ1EoKCgoKClWLVUoClZTLVduWFkxLTEtMS1aQUFfdUF6YlBQLVhRY3wzdmVOMjUyODNETmZYWGdNPWghPWlMTEtrTjJGMzI0Q2xYUG1LS25YKW9aWidaZnBQJ3FPIVdyTyp0LUF1QSB2fDF3TU14PUt5WCdBVnpPWChVAXp5eHd2dXRycXBvbm1sa2loZ2ZlY2JfWllXVlVTUVBPTk1LKikoJyFf`,
  musicTrack: MusicTrack.slime_rollcredits,
});
