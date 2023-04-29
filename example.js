import Shell from './index.js';
import { createInterface } from 'readline';

const play = new Shell ( {

$yallah: 'Salah Abdallah!',
$hello: 'Hello World!',
'$22': 'Abo Traika',
$other: { '$13': 'Faddy Michel' }

} ) [ Symbol .for ( 'shell/play' ) ];
const cli = createInterface ( {

input: process .stdin,
output: process .stdout,
completer: line => play ( Symbol .for ( 'shell/complete' ), line .toLowerCase () )

} );

cli .on ( 'line', line => {

try {

console .log (
play ( Symbol .for ( 'shell/enter' ), line .toLowerCase () )
);

} catch ( error ) {

console .error ( error .toString () );

}

cli .prompt ();

} );

cli .prompt ();
