import Scenarist from '@faddymichel/scenarist';

export default class Shell {

constructor ( script = {} ) {

const shell = this;

Object .defineProperties ( shell, {

[ Symbol .for ( 'shell/play' ) ]: {

value: Scenarist ( {

script,
setting: shell

} )

},
[ Symbol .for ( 'shell/script' ) ]: {

value: script

}

} );

}

delimiter = /\s+/;
openingDelimiter = '(';
closingDelimiter = ')';

[ Symbol .for ( 'shell/parse' ) ] ( line ) {

const { play, setting: shell } = this ( Symbol .for ( 'play/details' ) );

const start = line .lastIndexOf ( shell .openingDelimiter );
const end = line .indexOf ( shell .closingDelimiter, start );
const prefix = line .slice ( start > 0 ? 0 : -1, start );
const expansion = line .slice ( start + shell .openingDelimiter .length, end > -1 ? end : undefined );
const suffix = line .slice ( end + shell .closingDelimiter .length );

return { start, end, prefix, expansion, suffix };

}

[ Symbol .for ( 'shell/enter' ) ] ( line ) {

const { play, setting: shell } = this ( Symbol .for ( 'play/details' ) );
const { start, end, prefix, expansion, suffix } = play ( Symbol .for ( 'shell/parse' ), line );

if ( start > end )
throw Error ( 'Unmatching expansion delimiters' );

else if ( start > -1 )
return play ( Symbol .for ( 'shell/enter' ), prefix + play ( Symbol .for ( 'shell/enter' ), expansion ) + suffix );

line = line .trim () .split ( shell .delimiter );

return play ( ... line );

}

[ Symbol .for ( 'shell/complete' ) ] ( line ) {

const { play, setting: shell, script } = this ( Symbol .for ( 'play/details' ) );
const { start, end, expansion } = play ( Symbol .for ( 'shell/parse' ), line );
const scenario = ( start > -1 ? expansion : line ) .trimStart () .split ( shell .delimiter );

scenario .splice ( -1, 0, Symbol .for ( 'shell/completeDirection' ) );

try {

return play ( ... scenario );

} catch ( error ) {

console .error ( error );

return [];

}

}

[ Symbol .for ( 'shell/completeDirection' ) ] ( input ) {

const { play } = this ( Symbol .for ( 'play/details' ) );

return [

[ ... play ( Symbol .for ( 'shell/completeScriptDirection' ), input ), ... play ( Symbol .for ( 'shell/completeSettingDirection' ), input ) ],
input

];

}

[ Symbol .for ( 'shell/completeScriptDirection' ) ] ( input, secret ) {

const details = this ( Symbol .for ( 'play/details' ) );

let script = secret ?.[ $ .pattern ];

if ( script === undefined )
( { script } = details );

const { play } = details;

if ( ! script || typeof script === 'function' )
return [];

return [

... Object .keys ( Object .getOwnPropertyDescriptors ( script ) )
.filter ( direction => direction .startsWith ( '$' + input ) )
.map ( direction => direction .slice ( 1 ) + ' ' ),
... play ( Symbol .for ( 'shell/completeScriptDirection' ), input, { [ $ .pattern ]: Object .getPrototypeOf ( script ) } )

];

}

[ Symbol .for ( 'shell/completeSettingDirection' ) ] ( input, secret ) {

const { play, setting: shell } = this ( Symbol .for ( 'play/details' ) );
let _shell = secret ?.[ $ .pattern ];

if ( _shell === undefined )
_shell = shell;

if ( ! _shell || _shell ?.constructor === Object )
return [];

return [ ... Object .keys ( Object .getOwnPropertyDescriptors ( _shell ) )
.filter ( direction => direction !== 'constructor' && direction .startsWith ( input ) && typeof _shell [ direction ] === 'function' )
.map ( direction => direction + ' ' ),
... play ( Symbol .for ( 'shell/completeSettingDirection' ), input, { [ $ .pattern ]: Object .getPrototypeOf ( _shell ) } ) ];

}

[ '.' ] ( ... scenario ) {

const { play, script, location } = this ( Symbol .for ( 'play/details' ) );

if ( scenario .length )
return play ( ... scenario );

return {

play,
prompt: location .join ( ' ' )

};

}

[ '..' ] ( ... scenario ) {

let { play, binder } = this ( Symbol .for ( 'play/details' ) );

play = binder ?.play || play;

if ( play )
return play ( '.', ... scenario );

}

[ '+' ] ( direction ) {

const { script } = this ( Symbol .for ( 'play/details' ) );

if ( typeof direction === 'string' && direction .length )
try {

script [ '$' + direction ] = {};

} catch ( error ) {

console .error ( '(Error: Could not create a new direction)' );

}

}

};

const $ = { pattern: Symbol ( 'shell/$pattern' ) };
