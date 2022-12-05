import Scenarist from '@faddymichel/scenarist';

export default class Language {

constructor ( script ) {

const language = this;

return Object .defineProperty ( language, Symbol .for ( 'language/scenarist' ), {

value: Scenarist ( { script, setting: language } )

} ) [ Symbol .for ( 'language/scenarist' ) ];

}

[ Symbol .for ( 'language/delimiter' ) ] = /\s+/;
[ Symbol .for ( 'language/opening-delimiter' ) ] = '(';
[ Symbol .for ( 'language/closing-delimiter' ) ] = ')';

[ Symbol .for ( 'language/parse' ) ] ( line ) {

const { scenarist, setting: language } = this ( Symbol .for ( 'scenarist/details' ) );
const delimiter = language [ Symbol .for ( 'language/delimiter' ) ];
const opening = language [ Symbol .for ( 'language/opening-delimiter' ) ];
const closing = language [ Symbol .for ( 'language/closing-delimiter' ) ];
const start = line .lastIndexOf ( opening );
const end = line .indexOf ( closing, start );
const prefix = line .slice ( start > 0 ? 0 : -1, start );
const expansion = line .slice ( start + language [ Symbol .for ( 'language/opening-delimiter' ) ] .length, end > -1 ? end : undefined );
const suffix = line .slice ( end + language [ Symbol .for ( 'language/closing-delimiter' ) ] .length );

return { start, end, prefix, expansion, suffix };

}

[ Symbol .for ( 'language/enter' ) ] ( line ) {

const { scenarist, setting: language } = this ( Symbol .for ( 'scenarist/details' ) );
const { start, end, prefix, expansion, suffix } = scenarist ( Symbol .for ( 'language/parse' ), line );

if ( start > end )
throw Error ( 'Unmatching expansion delimiters' );

else if ( start > -1 )
return scenarist ( Symbol .for ( 'language/enter' ), prefix + scenarist ( Symbol .for ( 'language/enter' ), expansion ) + suffix );

return scenarist ( ... line .trim () .split ( language [ Symbol .for ( 'language/delimiter' ) ] ) );

}

[ Symbol .for ( 'language/complete' ) ] ( line ) {

const { scenarist, setting: language, script } = this ( Symbol .for ( 'scenarist/details' ) );

if ( typeof script === 'function' )
return [];

const { start, end, expansion } = scenarist ( Symbol .for ( 'language/parse' ), line );
const scenario = ( start > -1 ? expansion : line ) .trimStart () .split ( language [ Symbol .for ( 'language/delimiter' ) ] );

scenario .splice ( -1, 0, Symbol .for ( 'language/completeDirection' ) );

try {

return scenarist ( ... scenario );

} catch ( error ) {

return [];

}

}

[ Symbol .for ( 'language/completeDirection' ) ] ( input ) {

const { scenarist, script } = this ( Symbol .for ( 'scenarist/details' ) );

if ( typeof script === 'function' )
return [];

return [

[

... (
Object .keys ( script )
.filter ( direction => direction .startsWith ( input ) )
.map ( direction => direction + ' ' )
), ... ( scenarist ( Symbol .for ( 'language/pattern' ), Symbol .for ( 'language/completeDirection' ), input ) ?.[ 0 ] || [] )

],
input

];

}

[ '.' ] ( ... scenario ) {

const { scenarist, location } = this ( Symbol .for ( 'scenarist/details' ) );

if ( scenario .length )
return scenarist ( ... scenario );

return {

language: scenarist,
prompt: location .join ( ' ' )

};

}

[ '..' ] ( ... scenario ) {

let { setting: language, location } = this ( Symbol .for ( 'scenarist/details' ) );

location = location .slice ( 0, -1 );

const scenarist = language [ Symbol .for ( 'language/scenarist' ) ];
if ( scenario .length )
return scenarist ( ... scenario );

return {

language: scenarist,
prompt: location .join ( ' ' )

};

}

[ Symbol .for ( 'language/pattern' ) ] ( ... scenario ) {

let { script, setting: language } = this ( Symbol .for ( 'scenarist/details' ) );

script = Object .getPrototypeOf ( script );

if ( ! script )
return;

const history = language [ Symbol .for ( 'language/history' ) ] = language [ Symbol .for ( 'language/history' ) ] || {};
const pattern = history [ script ] = history [ script ] || Scenarist ( { script, setting: language } );

return scenario .length ? pattern ( ... scenario ) : pattern;

}

};
