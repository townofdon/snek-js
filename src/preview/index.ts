
import p5 from 'p5';

import '../windowManagement';
import { sketch } from './preview';
import { getEditorUrl } from '../editor/utils/publishUtils';

function main() {
  new p5(sketch)
}

main();

function populateEditMapLink() {
  const query = new URLSearchParams(window.location.search);
  const data = query.get('data');
  const url = getEditorUrl(data);
  const button = document.getElementById('buttonEditMap');
  button.setAttribute('href', url);
  button.setAttribute('target', '_blank');
}

populateEditMapLink();
