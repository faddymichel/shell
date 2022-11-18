import Scenarist from '@faddymichel/scenarist';

export default function Language ( script ) {

const language = this;

if ( ! ( language instanceof Language ) )
return new Language ( script );

return Object .defineProperty ( language, Symbol .for ( 'language/scenarist' ), { value: Scenarist ( { script, setting: language } ) } ) [ Symbol .for ( 'language/scenarist' ) ];

};

Language .prototype = {

[ Symbol .for ( 'language/delimiter' ) ]: /\s+/,
[ Symbol .for ( 'language/opening-delimiter' ) ]: '(',
[ Symbol .for ( 'language/closing-delimiter' ) ]: ')',

[ Symbol .for ( 'language/parse' ) ] ( line ) {

const { scenarist, setting: language } = this ();
const delimiter = language [ Symbol .for ( 'language/delimiter' ) ];
const opening = language [ Symbol .for ( 'language/opening-delimiter' ) ];
const closing = language [ Symbol .for ( 'language/closing-delimiter' ) ];
const start = line .lastIndexOf ( opening );
const end = line .indexOf ( closing, start );
const prefix = line .slice ( start > 0 ? 0 : -1, start );
const expansion = line .slice ( start + language [ Symbol .for ( 'language/opening-delimiter' ) ] .length, end > -1 ? end : undefined );
const suffix = line .slice ( end + language [ Symbol .for ( 'language/closing-delimiter' ) ] .length );

return { start, end, prefix, expansion, suffix };

},

[ Symbol .for ( 'language/enter' ) ] ( line ) {

const { scenarist, setting: language } = this ();
const { start, end, prefix, expansion, suffix } = scenarist ( Symbol .for ( 'language/parse' ), line );

if ( start > end )
throw Error ( 'Unmatching expansion delimiters' );

else if ( start > -1 )
return scenarist ( Symbol .for ( 'language/enter' ), prefix + scenarist ( Symbol .for ( 'language/enter' ), expansion ) + suffix );

return scenarist ( ... line .trim () .split ( language [ Symbol .for ( 'language/delimiter' ) ] ) );

},

[ Symbol .for ( 'language/complete' ) ] ( line ) {

const { scenarist, setting: language, script } = this ();
const { start, end, expansion } = scenarist ( Symbol .for ( 'language/parse' ), line );
const scenario = ( start > -1 ? expansion : line ) .trimStart () .split ( language [ Symbol .for ( 'language/delimiter' ) ] );
const [ input ] = scenario .splice ( -1, 1, Symbol .for ( 'language/completeDirection' ) );

switch ( typeof script [ scenario [ scenario .length - 2 ] ] ) {

case 'object':
case 'undefined':

try {

return scenarist ( ... scenario, input );

} catch ( error ) {

return [];

}

default:
return [];

}

},

[ Symbol .for ( 'language/completeDirection' ) ] ( input ) {

const { script } = this ();

return [

Object .keys ( Object .getOwnPropertyDescriptors ( script ) )
.filter ( direction => direction .startsWith ( input ) )
.map ( direction => direction + ' ' ),
input

];

},

[ '.' ] ( ... scenario ) {

const { scenarist, location } = this ();

if ( scenario .length )
return scenarist ( ... scenario );

return {

language: scenarist,
prompt: location .join ( ' ' )

};

},

[ '..' ] ( ... scenario ) {

let { language, location } = this ();

location = location .slice ( 0, -1 );

const scenarist = language [ Symbol .for ( 'language/scenarist' ) ];
if ( scenario .length )
return scenarist ( ... scenario );

return {

language: scenarist,
prompt: location .join ( ' ' )

};

}

};
