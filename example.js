import Shell from './index.js';
import { createInterface } from 'readline';

const shell = new Shell ();
const interpreter = shell [ Symbol .for ( 'shell/interpreter' ) ] ( {

$yallah: 'Salah Abdallah!',
$hello: 'Hello World!',
'$22': 'Abo Traika',
$other: { '$13': 'Faddy Michel' }

} );
const cli = createInterface ( {

input: process .stdin,
output: process .stdout,
completer: line => interpreter ( Symbol .for ( 'shell/complete' ), line .toLowerCase () )

} );

cli .on ( 'line', line => {

try {

console .log (
interpreter ( Symbol .for ( 'shell/enter' ), line .toLowerCase () )
);

} catch ( error ) {

console .error ( error .toString () );

}

cli .prompt ();

} );

cli .prompt ();
