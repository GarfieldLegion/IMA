import { contracts } from "./deploySchain";
import { manifestSetup } from "./generateManifest";
import { upgrade } from "./upgrade";

function stringValue(value: string | undefined) {
    if (value) {
        return value;
    } else {
        return "";
    }
}

async function main() {
    const pathToManifest: string = stringValue(process.env.MANIFEST);
    await manifestSetup( pathToManifest );
    await upgrade(
        "1.1.0",
        contracts,
        async( safeTransactions, abi ) => undefined,
        async( safeTransactions, abi ) => undefined,
        "proxySchain"
    );
}

if( require.main === module ) {
    main()
        .then( () => process.exit( 0 ) )
        .catch( error => {
            console.error( error );
            process.exit( 1 );
        } );
}