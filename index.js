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

line = line .trim () .split ( language [ Symbol .for ( 'language/delimiter' ) ] );

return scenarist ( ... line );

}

[ Symbol .for ( 'language/complete' ) ] ( line ) {

const { scenarist, setting: language, script } = this ( Symbol .for ( 'scenarist/details' ) );
const { start, end, expansion } = scenarist ( Symbol .for ( 'language/parse' ), line );
const scenario = ( start > -1 ? expansion : line ) .trimStart () .split ( language [ Symbol .for ( 'language/delimiter' ) ] );

scenario .splice ( -1, 0, Symbol .for ( 'language/completeDirection' ) );

try {

return scenarist ( ... scenario );

} catch ( error ) {

console .error ( error );

return [];

}

}

[ Symbol .for ( 'language/completeDirection' ) ] ( input ) {

const { scenarist } = this ( Symbol .for ( 'scenarist/details' ) );

return [

[ ... scenarist ( Symbol .for ( 'language/completeScriptDirection' ), input ), ... scenarist ( Symbol .for ( 'language/completeSettingDirection' ), input ) ],
input

];

}

[ Symbol .for ( 'language/completeScriptDirection' ) ] ( input, ... types ) {

const { scenarist, script } = this ( Symbol .for ( 'scenarist/details' ) );

if ( typeof script === 'function' )
return [];

return Object .keys ( Object .getOwnPropertyDescriptors ( script ) )
.filter ( direction => direction .startsWith ( input ) && ( ! types .length || types .include ( typeof script [ direction ] ) ) )
.map ( direction => direction + ' ' );

}

[ Symbol .for ( 'language/completeSettingDirection' ) ] ( input, secret ) {

const { scenarist, setting } = this ( Symbol .for ( 'scenarist/details' ) );
let language = secret ?.[ $ .pattern ];

if ( language === undefined ) //|| language ?.constructor === Object )
language = setting;

if ( ! language || language ?.constructor === Object )
return [];

return [ ... Object .keys ( Object .getOwnPropertyDescriptors ( language ) )
.filter ( direction => direction !== 'constructor' && direction .startsWith ( input ) && typeof language [ direction ] === 'function' )
.map ( direction => direction + ' ' ),
... scenarist ( Symbol .for ( 'language/completeSettingDirection' ), input, { [ $ .pattern ]: Object .getPrototypeOf ( language ) } ) ];

}

[ '.' ] ( ... scenario ) {

const { scenarist, script, location } = this ( Symbol .for ( 'scenarist/details' ) );

if ( scenario .length )
return scenarist ( ... scenario );

return {

language: scenarist,
prompt: location .join ( ' ' )

};

}

[ '..' ] ( ... scenario ) {

const { location, setting: language } = this ( Symbol .for ( 'scenarist/details' ) );
const scenarist = language [ Symbol .for ( 'language/scenarist' ) ];

scenario = [ ... location .slice ( 0, -1 ), '.', ... scenario ];

return scenarist ( ... scenario );

}

};

const $ = { pattern: Symbol ( 'language/$pattern' ) };
