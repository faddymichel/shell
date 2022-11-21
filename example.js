import Language from './index.js';
import { createInterface } from 'readline';

const $ = new Language ( {

yallah: 'Salah Abdallah!',
hello: 'Hello World!',
'22': 'Abo Traika',
other: { '13': 'Faddy Michel' }

} );
const cli = createInterface ( {

input: process .stdin,
output: process .stdout,
completer: line => $ ( Symbol .for ( 'language/complete' ), line .toLowerCase () )

} );

cli .on ( 'line', line => {

try {

console .log (
$ ( Symbol .for ( 'language/enter' ), line .toLowerCase () )
);

} catch ( error ) {

console .error ( error .toString () );

}

cli .prompt ();

} );

cli .prompt ();
