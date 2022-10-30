// SPDX-License-Identifier: AGPL-3.0-only

const { cc } = require( "./utils" );

/**
 * @license
 * SKALE IMA
 *
 * SKALE IMA is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SKALE IMA is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with SKALE IMA.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @file pwa.js
 * @copyright SKALE Labs 2019-Present
 */

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function compute_walk_node_idices( nNodeNumber, nNodesCount ) {
    if( nNodesCount <= 1 )
        return []; // PWA is N/A
    if( !( nNodeNumber >= 0 && nNodeNumber < nNodesCount ) )
        return []; // PWA is N/A
    let i = nNodeNumber - 1;
    if( i < 0 )
        i = nNodesCount - 1;
    const arr_walk_node_idices = [];
    for( ; true; ) {
        if( i == nNodeNumber )
            break;
        arr_walk_node_idices.push( i );
        -- i;
        if( i < 0 )
            i = nNodesCount - 1;
    }
    return arr_walk_node_idices;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function check_on_loop_start() {
    try {
        if( ! imaState.isPWA )
            return true; // PWA is N/A
        if( imaState.nNodesCount <= 1 )
            return true; // PWA is N/A
        if( !( imaState.nNodeNumber >= 0 && imaState.nNodeNumber < imaState.nNodesCount ) )
            return true; // PWA is N/A
        if( ! imaState.joSChainNetworkInfo )
            return true; // PWA is N/A
        const jarrNodes = imaState.joSChainNetworkInfo.network;
        if( ! jarrNodes )
            throw new Error( "S-Chain network info is not available yet to PWA" );
        const arr_busy_node_indices = [];
        const arr_walk_node_idices = compute_walk_node_idices( imaState.nNodeNumber, imaState.nNodesCount );
        if( imaState.isPrintPWA ) {
            log.write(
                cc.debug( "PWA will check loop start contition via node(s) sequence " ) +
                cc.j( arr_busy_node_indices ) + cc.debug( "..." ) +
                "\n" );
        }
        const nUtcUnixTimeStamp = Math.floor( ( new Date() ).getTime() / 1000 );
        for( let i = 0; i < arr_walk_node_idices.length; ++i ) {
            const walk_node_index = arr_walk_node_idices[i];
            const joNode = jarrNodes[walk_node_index];
            if( "pwaState" in joNode && "isImaSingleTransferLoopInProgress" in joNode.pwaState &&
                joNode.pwaState.isImaSingleTransferLoopInProgress &&
                joNode.pwaState.ts != 0 &&
                nUtcUnixTimeStamp >= joNode.pwaState.ts
            ) {
                const d = nUtcUnixTimeStamp - joNode.pwaState.ts;
                if( d >= imaState.nTimeoutSecondsPWA ) {
                    if( imaState.isPrintPWA ) {
                        log.write(
                            cc.warning( "PWA busy state timeout for node #" ) + cc.info( walk_node_index ) +
                            cc.debug( ", old timestamp is " ) + cc.info( joNode.pwaState.ts ) +
                            cc.debug( ", current system timestamp is " ) + cc.info( nUtcUnixTimeStamp ) +
                            cc.debug( ", duration " ) + cc.info( d ) +
                            cc.debug( " is greater than conditionally allowed " ) + cc.info( imaState.nTimeoutSecondsPWA ) +
                            cc.debug( " and exceeeded by " ) + cc.info( d - imaState.nTimeoutSecondsPWA ) + cc.debug( " second(s)" ) +
                            "\n" );
                    }
                    joNode.pwaState.isImaSingleTransferLoopInProgress = false;
                    joNode.pwaState.ts = 0;
                    continue;
                }
                arr_busy_node_indices.push( walk_node_index );
            }
        } // for( let i = 0; i < arr_walk_node_idices.length; ++i )
        if( arr_busy_node_indices.length > 0 ) {
            if( imaState.isPrintPWA )
                log.write( cc.warning( "PWA loop start condition check failed, busy node(s): " ) + cc.j( arr_busy_node_indices ) + "\n" );
            return false;
        }
        if( imaState.isPrintPWA )
            log.write( cc.success( "PWA loop start condition check passed" ) + "\n" );
    } catch ( err ) {
        log.write( cc.error( "Exception in PWA check on loop start: " ) + cc.error( owaspUtils.extract_error_message( err ) ) + "\n" );
    }
    return true;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function handle_loop_state_arrived( nNodeNumber, isStart, ts, signature ) {
    const se = isStart ? "start" : "end";
    let isSuccess = false;
    try {
        if( ! imaState.isPWA )
            return true;
        if( imaState.nNodesCount <= 1 )
            return true; // PWA is N/A
        if( !( imaState.nNodeNumber >= 0 && imaState.nNodeNumber < imaState.nNodesCount ) )
            return true; // PWA is N/A
        if( ! imaState.joSChainNetworkInfo )
            return true; // PWA is N/A
        const jarrNodes = imaState.joSChainNetworkInfo.network;
        if( ! jarrNodes )
            throw new Error( "S-Chain network info is not available yet to PWA" );
        const joNode = jarrNodes[nNodeNumber];
        if( ! ( "pwaState" in joNode ) )
            joNode.pwaState = { };
        if( imaState.isPrintPWA ) {
            log.write(
                cc.debug( "PWA loop-" ) + cc.attention( se ) + cc.debug( " state arrived for node " ) + cc.info( nNodeNumber ) +
                cc.debug( ", PWA state " ) + cc.j( joNode.pwaState ) +
                cc.debug( ", arrived signature is " ) + cc.j( signature ) +
                "\n" );
        }
        const strMessageHash = imaBLS.keccak256_pwa( nNodeNumber, isStart, 0 + ts );
        const isSignatureOK = await imaBLS.do_verify_ready_hash( strMessageHash, nNodeNumber, signature );
        if( ! isSignatureOK )
            throw new Error( "BLS verification failed" );
        joNode.pwaState.ts = 0 + ts;
        joNode.pwaState.isImaSingleTransferLoopInProgress = isStart ? true : false;
        if( imaState.isPrintPWA ) {
            log.write(
                cc.success( "PWA loop-" ) + cc.attention( se ) + cc.success( " state successfully verified for node " ) + cc.info( nNodeNumber ) +
                cc.success( ", now have PWA state " ) + cc.j( joNode.pwaState ) +
                cc.success( ", arrived signature is " ) + cc.j( signature ) +
                "\n" );
        }
        isSuccess = true;
    } catch ( err ) {
        isSuccess = false;
        log.write(
            cc.error( "Exception in PWA handler for loop-" ) + cc.attention( se ) +
            cc.error( " for node " ) + cc.info( nNodeNumber ) +
            cc.error( ", PWA state " ) + cc.j( joNode.pwaState ) +
            cc.error( ", arrived signature is " ) + cc.j( signature ) +
            cc.error( ", error is: " ) + cc.error( owaspUtils.extract_error_message( err ) ) +
            "\n" );
    }
    return isSuccess;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function notify_on_loop_impl( isStart ) {
    const se = isStart ? "start" : "end";
    try {
        if( ! imaState.isPWA )
            return true;
        if( imaState.nNodesCount <= 1 )
            return true; // PWA is N/A
        if( !( imaState.nNodeNumber >= 0 && imaState.nNodeNumber < imaState.nNodesCount ) )
            return true; // PWA is N/A
        if( ! imaState.joSChainNetworkInfo )
            return true; // PWA is N/A
        const jarrNodes = imaState.joSChainNetworkInfo.network;
        if( ! jarrNodes )
            throw new Error( "S-Chain network info is not available yet to PWA" );
        const nUtcUnixTimeStamp = Math.floor( ( new Date() ).getTime() / 1000 );
        //
        const strMessageHash = imaBLS.keccak256_pwa( 0 + imaState.nNodeNumber, isStart, nUtcUnixTimeStamp );
        const signature = await imaBLS.do_sign_ready_hash( strMessageHash );
        await handle_loop_state_arrived( imaState.nNodeNumber, isStart, nUtcUnixTimeStamp, signature ); // save own started
        //
        for( let i = 0; i < jarrNodes.length; ++i ) {
            if( i == imaState.nNodeNumber )
                continue; // skip this node
            const joNode = jarrNodes[i];
            const strNodeURL = imaUtils.compose_ima_agent_node_url( joNode );
            const rpcCallOpts = null;
            /*await*/ rpcCall.create( strNodeURL, rpcCallOpts, async function( joCall, err ) {
                if( err ) {
                    log.write(
                        cc.error( "PWA failed to create loop-" ) + cc.attention( se ) + cc.error( " notifiction RPC call to node #" ) + cc.info( i ) +
                        cc.error( " with URL " ) + cc.u( strNodeURL ) +
                        cc.error( ", error is: " ) + cc.error( owaspUtils.extract_error_message( err ) ) + "\n"
                    );
                    return;
                }
                /*await*/ joCall.call( {
                    method: "skale_imaNotifyLoopWork",
                    params: {
                        nNodeNumber: 0 + imaState.nNodeNumber,
                        isStart: isStart ? true : false,
                        ts: nUtcUnixTimeStamp,
                        signature: signature
                    }
                }, async function( joIn, joOut, err ) {
                    if( err ) {
                        log.write(
                            cc.error( "PWA failed to perform loop-" ) + cc.attention( se ) + cc.error( " notifiction RPC call to node #" ) + cc.info( i ) +
                            cc.error( " with URL " ) + cc.u( strNodeURL ) +
                            cc.error( ", error is: " ) + cc.error( owaspUtils.extract_error_message( err ) ) + "\n"
                        );
                        await joCall.disconnect();
                        return;
                    }
                    // if( joOut.result...
                    if( imaState.isPrintPWA ) {
                        log.write(
                            cc.success( "Was successfully sent PWA loop-" ) + cc.attention( se ) + cc.success( " notifiction to node #" ) + cc.info( i ) +
                            cc.success( " with URL " ) + cc.u( strNodeURL ) + "\n"
                        );
                    }
                    await joCall.disconnect();
                } ); // joCall.call ...
            } ); // rpcCall.create ...
        } // for( let i = 0; i < jarrNodes.length; ++i )
    } catch ( err ) {
        log.write( cc.error( "Exception in PWA notify on loop " ) + cc.attention( se ) + cc.error( ": " ) + cc.error( owaspUtils.extract_error_message( err ) ) + "\n" );
    }
    return true;
}

async function notify_on_loop_start() {
    return await notify_on_loop_impl( true );
}

async function notify_on_loop_end() {
    return await notify_on_loop_impl( false );
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports.check_on_loop_start = check_on_loop_start;
module.exports.handle_loop_state_arrived = handle_loop_state_arrived;
module.exports.notify_on_loop_start = notify_on_loop_start;
module.exports.notify_on_loop_end = notify_on_loop_end;
