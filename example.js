import Language from './index.js';
import script from '@faddymichel/scenarist/example/greeter.js';

const $ = Language ( script );

console .log ( $ ( Symbol .for ( 'language/enter' ), 'Math pow ( Math random ) ( Math round ( Math random ) )' ) );

console .log ( $ ( Symbol .for ( 'language/complete' ), '' ) );

console .log ( $ ( Symbol .for ( 'language/enter' ), 'Math .' ) );
