import Scenarist from '@faddymichel/scenarist';

export default class Shell {

[ Symbol .for ( 'shell/interpreter' ) ] ( script = {} ) {

if ( typeof this === 'function' )
return this ( Symbol .for ( 'scenarist/details' ) ) .scenarist;

const setting = Object .setPrototypeOf ( { script }, this );
const interpreter = Scenarist ( { script, setting } );

return interpreter;

}

[ Symbol .for ( 'shell/delimiter' ) ] = /\s+/;
[ Symbol .for ( 'shell/opening-delimiter' ) ] = '(';
[ Symbol .for ( 'shell/closing-delimiter' ) ] = ')';

[ Symbol .for ( 'shell/parse' ) ] ( line ) {

const { scenarist, setting: shell } = this ( Symbol .for ( 'scenarist/details' ) );
const delimiter = shell [ Symbol .for ( 'shell/delimiter' ) ];
const opening = shell [ Symbol .for ( 'shell/opening-delimiter' ) ];
const closing = shell [ Symbol .for ( 'shell/closing-delimiter' ) ];
const start = line .lastIndexOf ( opening );
const end = line .indexOf ( closing, start );
const prefix = line .slice ( start > 0 ? 0 : -1, start );
const expansion = line .slice ( start + shell [ Symbol .for ( 'shell/opening-delimiter' ) ] .length, end > -1 ? end : undefined );
const suffix = line .slice ( end + shell [ Symbol .for ( 'shell/closing-delimiter' ) ] .length );

return { start, end, prefix, expansion, suffix };

}

[ Symbol .for ( 'shell/enter' ) ] ( line ) {

const { scenarist, setting: shell } = this ( Symbol .for ( 'scenarist/details' ) );
const { start, end, prefix, expansion, suffix } = scenarist ( Symbol .for ( 'shell/parse' ), line );

if ( start > end )
throw Error ( 'Unmatching expansion delimiters' );

else if ( start > -1 )
return scenarist ( Symbol .for ( 'shell/enter' ), prefix + scenarist ( Symbol .for ( 'shell/enter' ), expansion ) + suffix );

line = line .trim () .split ( shell [ Symbol .for ( 'shell/delimiter' ) ] );

return scenarist ( ... line );

}

[ Symbol .for ( 'shell/complete' ) ] ( line ) {

const { scenarist, setting: shell, script } = this ( Symbol .for ( 'scenarist/details' ) );
const { start, end, expansion } = scenarist ( Symbol .for ( 'shell/parse' ), line );
const scenario = ( start > -1 ? expansion : line ) .trimStart () .split ( shell [ Symbol .for ( 'shell/delimiter' ) ] );

scenario .splice ( -1, 0, Symbol .for ( 'shell/completeDirection' ) );

try {

return scenarist ( ... scenario );

} catch ( error ) {

console .error ( error );

return [];

}

}

[ Symbol .for ( 'shell/completeDirection' ) ] ( input ) {

const { scenarist } = this ( Symbol .for ( 'scenarist/details' ) );

return [

[ ... scenarist ( Symbol .for ( 'shell/completeScriptDirection' ), input ), ... scenarist ( Symbol .for ( 'shell/completeSettingDirection' ), input ) ],
input

];

}

[ Symbol .for ( 'shell/completeScriptDirection' ) ] ( input, secret ) {

const details = this ( Symbol .for ( 'scenarist/details' ) );

let script = secret ?.[ $ .pattern ];

if ( script === undefined )
( { script } = details );

const { scenarist } = details;

if ( ! script || typeof script === 'function' )
return [];

return [

... Object .keys ( Object .getOwnPropertyDescriptors ( script ) )
.filter ( direction => direction .startsWith ( '$' + input ) )
.map ( direction => direction .slice ( 1 ) + ' ' ),
... scenarist ( Symbol .for ( 'shell/completeScriptDirection' ), input, { [ $ .pattern ]: Object .getPrototypeOf ( script ) } )

];

}

[ Symbol .for ( 'shell/completeSettingDirection' ) ] ( input, secret ) {

const { scenarist, setting } = this ( Symbol .for ( 'scenarist/details' ) );
let shell = secret ?.[ $ .pattern ];

if ( shell === undefined ) //|| shell ?.constructor === Object )
shell = setting;

if ( ! shell || shell ?.constructor === Object )
return [];

return [ ... Object .keys ( Object .getOwnPropertyDescriptors ( shell ) )
.filter ( direction => direction !== 'constructor' && direction .startsWith ( input ) && typeof shell [ direction ] === 'function' )
.map ( direction => direction + ' ' ),
... scenarist ( Symbol .for ( 'shell/completeSettingDirection' ), input, { [ $ .pattern ]: Object .getPrototypeOf ( shell ) } ) ];

}

[ '.' ] ( ... scenario ) {

const { scenarist, script, location } = this ( Symbol .for ( 'scenarist/details' ) );

if ( scenario .length )
return scenarist ( ... scenario );

return {

shell: scenarist,
prompt: location .join ( ' ' )

};

}

[ '..' ] ( ... scenario ) {

let { scenarist, binder } = this ( Symbol .for ( 'scenarist/details' ) );

scenarist = binder ?.scenarist || scenarist;

if ( scenarist )
return scenarist ( '.', ... scenario );

}

[ '+' ] ( direction ) {

const { script } = this ( Symbol .for ( 'scenarist/details' ) );

if ( typeof direction === 'string' && direction .length )
try {

script [ '$' + direction ] = {};

} catch ( error ) {

console .error ( '(Error: Could not create a new direction)' );

}

}

};

const $ = { pattern: Symbol ( 'shell/$pattern' ) };
