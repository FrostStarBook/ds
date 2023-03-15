// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import {State} from "cog/State.sol";
import {LibString} from "cog/utils/LibString.sol";
import {PREFIX_MESSAGE, REVOKE_MESSAGE} from "cog/SessionRouter.sol";

import {Game} from "@ds/Game.sol";
import {Actions} from "@ds/actions/Actions.sol";
import {Schema, Node, BiomeKind} from "@ds/schema/Schema.sol";

using Schema for State;

contract GameTest is Test {
    Game internal game;
    State internal state;

    // accounts
    address aliceAccount;

    function setUp() public {
        // setup game
        game = new Game();

        // fetch the State to play with
        state = game.getState();

        // setup users
        uint256 alicePrivateKey = 0xA11CE;
        aliceAccount = vm.addr(alicePrivateKey);
    }

    function testDevSpawn() public {
        // dispatch as alice
        vm.startPrank(aliceAccount);

        // spawn a tile
        game.getDispatcher().dispatch(
            abi.encodeCall(
                Actions.DEV_SPAWN_TILE,
                (
                    BiomeKind.DISCOVERED,
                    1, // q
                    1, // r
                    1 // s
                )
            )
        );

        // spawn a seeker at that tile
        game.getDispatcher().dispatch(
            abi.encodeCall(
                Actions.DEV_SPAWN_SEEKER,
                (
                    aliceAccount, // owner
                    1, // seeker id (sid)
                    1, // q
                    1, // r
                    1 // s
                )
            )
        );

        assertEq(
            state.getCurrentLocation(Node.Seeker(1), uint64(block.number)),
            Node.Tile(0, 1, 1, 1),
            "expected next seeker to start at tile 1,1,1"
        );

        // stop being alice
        vm.stopPrank();
    }

    function testAuthorizeAddrWithSignerAsOwner() public {
        // fake account for alice
        uint256 aliceKey = 0x11CE;
        address aliceAddr = vm.addr(aliceKey);

        // mock account for a fake relayer
        address relayAddr = vm.addr(0xfb1);
        // mock up a session key
        uint256 sessionKey = 0x5e55;
        address sessionAddr = vm.addr(sessionKey);
        // expected custom auth message
        bytes memory authMessage = abi.encodePacked(
            "Welcome to Dawnseekers!",
            "\n\nThis site is requesting permission to interact with your Dawnseekers assets.",
            "\n\nSigning this message will not incur any fees.",
            "\n\nYou can revoke sessions and read more about them at https://dawnseekers.com/sessions",
            "\n\nPermissions: send-actions, spend-energy",
            "\n\nValid: 5 blocks",
            "\n\nSession: ",
            LibString.toHexString(sessionAddr)
        );

        // owner signs the message authorizing the session
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            aliceKey, keccak256(abi.encodePacked(PREFIX_MESSAGE, LibString.toString(authMessage.length), authMessage))
        );
        bytes memory sig = abi.encodePacked(r, s, v);

        // relay submits the auth request on behalf of owner
        vm.prank(relayAddr);
        game.getRouter().authorizeAddr(game.getDispatcher(), 5, 0, sessionAddr, sig);

        // should now be able to use sessionKey to sign actions to pass to router
        bytes24 seeker = Node.Seeker(111);
        bytes[] memory actions = new bytes[](1);
        actions[0] = abi.encodeCall(Actions.SPAWN_SEEKER, (seeker));
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(abi.encode(actions))));
        bytes[][] memory batchedActions = new bytes[][](1);
        batchedActions[0] = actions;
        bytes[] memory batchedSigs = new bytes[](1);
        (v, r, s) = vm.sign(sessionKey, digest);
        batchedSigs[0] = abi.encodePacked(r, s, v);
        vm.prank(relayAddr);
        game.getRouter().dispatch(batchedActions, batchedSigs);
        // check the action created seeker with correct owner
        assertEq(state.getOwnerAddress(seeker), aliceAddr);
    }
}