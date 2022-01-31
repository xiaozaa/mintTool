# Sturdy WebSocket

Tiny WebSocket wrapper that reconnects and resends failed messages.

[![Build
Status](https://travis-ci.org/dphilipson/sturdy-websocket.svg?branch=master)](https://travis-ci.org/dphilipson/sturdy-websocket)

## Introduction

Sturdy WebSocket is a small (< 4kb gzipped) wrapper around a WebSocket that
reconnects when the WebSocket closes. If `send()` is called while the backing
WebSocket is closed, then the messages are stored in a buffer and sent once the
connection is reestablished.

`SturdyWebSocket` fully implements the WebSocket API as described [by
MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket), including the
ready state constants, the `EventTarget` interface, and properties that you
probably don't care about like `bufferedAmount`. This means that it can be used
as a drop-in replacement for `WebSocket` with any existing code or other
libraries that consume WebSockets. **To the surrounding code, `SturdyWebSocket`
looks exactly like a regular `WebSocket` that never goes down, even in the
presence of network failures.**

## Table of Contents

<!-- toc -->

- [Usage](#usage)
- [Caveats](#caveats)
- [Installation](#installation)
- [Full API](#full-api)
  * [Options](#options)
    + [`allClearResetTime`](#allclearresettime)
    + [`connectTimeout`](#connecttimeout)
    + [`debug`](#debug)
    + [`minReconnectDelay`](#minreconnectdelay)
    + [`maxReconnectDelay`](#maxreconnectdelay)
    + [`maxReconnectAttempts`](#maxreconnectattempts)
    + [`reconnectBackoffFactor`](#reconnectbackofffactor)
    + [`shouldReconnect`](#shouldreconnect)
    + [`wsConstructor`](#wsconstructor)
  * [Additional Methods](#additional-methods)
    + [`reconnect()`](#reconnect)
  * [Additional Events](#additional-events)
    + [`down`](#down)
    + [`reopen`](#reopen)

<!-- tocstop -->

## Usage

```js
import SturdyWebSocket from "sturdy-websocket";

const ws = new SturdyWebSocket("wss://example.com");
ws.onopen = () => ws.send("Hello!");
ws.onmessage = event => console.log("I got a message that says " + event.data);
// Or if you prefer event listeners:
ws.addEventListener("message", event =>
    console.log("I already said this, but the message says " + event.data));

// Like with normal WebSockets, the protocol can be given as a second argument.
const wsWithProtocol = new SturdyWebSocket("wss://foo.com", "some-protocol");

// Options can be provided as the final argument.
const wsWithOptions = new SturdyWebSocket("wss://bar.com", {
    connectTimeout: 5000,
    maxReconnectAttempts: 5
    reconnectBackoffFactor: 1.3
});
```

Because it is imitating a regular WebSocket, `onclose` will only be called once,
after the `SturdyWebSocket` is closed permanently either by using `close()` or
because the `shouldReconnect` option returned false. If you are interested in
being notified when the backing connection is temporarily down, you may listen
for the additional events `"down"` and `"reopen"`:

```js
const ws = new SturdyWebSocket("wss://example.com");
ws.ondown = closeEvent => console.log("Closed for reason " + closeEvent.reason);
ws.onreopen = () => console.log("We're back up!");
// Or with event listeners
ws.addEventListener("down", closeEvent => "Yea, it's down.");
```

## Caveats

While Sturdy WebSockets are more reliable than standard WebSockets, there is
still an important failure case of which you should be aware. While rare, note
that it is possible for the connection to die without the client being aware,
such as if the power cord is pulled on the server. When this happens the Sturdy
WebSocket will not know to open a new connection as this cannot be detected
through the WebSocket protocol alone (at least without ping messages, which
cannot be sent from the browser client).

To avoid this, it is recommended that you manually watch for disconnected
sockets by periodically sending messages over the socket and checking for a
response (a "ping/pong" system). If you detect that the connection has died, you
should call the `[reconnect() method](#reconnect) to force a new connection to
be created.

Further, note that any messages sent to the server while the connection is in
this undetected dead state will be lost. To guarantee delivery of messages, you
must have the server send back a response to acknowledge the message has been
received.

## Installation

With Yarn:

```
yarn add sturdy-websocket
```

With NPM:

```
npm install --save sturdy-websocket
```

## Full API

As discussed above, `SturdyWebSocket` starts off by fully implementing the
[WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).
Only features beyond the standard API are discussed below.

### Options

Options are passed as an optional final argument to the constructor, for
example:

```js
import SturdyWebSocket from "sturdy-websocket";

const ws1 = new SturdyWebSocket("wss://foo.com", { maxReconnectAttempts: 5 });
const ws2 = new SturdyWebSocket("wss://bar.com", "some-protocol", {
    connectTimeout: 4000,
    reconnectBackoffFactor: 1.3,
});
```

All options which represent durations are in milliseconds.

#### `allClearResetTime`

Default: 5000

If a newly opened WebSocket closes immediately, it is considered to be a failed
connection for the purposes of increasing time between attempts and counting
towards `maxReconnectAttempts`. This option controls how long a connection must
remain open to be considered "successful" and reset these values.

#### `connectTimeout`

Default: 5000

When attempting to open a new connection, how long to wait before giving up and
making a new connection. Note that it is possible for an attempt to open a
WebSocket to stall forever, which is why this option is needed.

#### `debug`

Default: false

If true, print various debug information to `console.log`, such as notifying
about reconnect attempts.

#### `minReconnectDelay`

Default: 1000

The minimum positive time between failed reconnect attempts. Note that the first
reconnect attempt happens immediately on the first failure, so this is actually
the delay between the first and second reconnect attempts.

#### `maxReconnectDelay`

Default: 30000

The maximum time between failed reconnect attempts. Additional attempts will
repeatedly use this as their delay.

#### `maxReconnectAttempts`

Default: Infinity

If reconnects fail this many times in a row, then the `SturdyWebSocket` closes
permanently, providing the `CloseEvent` from the last failed reconnect attempt.

#### `reconnectBackoffFactor`

Default: 1.5

The factor by which the time between reconnect attempts increases after each
failure.

#### `shouldReconnect`

Default: `() => true`

A function which returns either a boolean or a promise resolving to a boolean,
which is called when the backing WebSocket closes to determine if a reconnect
attempt should be made. It is provided the `CloseEvent` as an argument. For
example:

```js
const ws = new SturdyWebSocket("wss://example.com", {
    shouldReconnect: closeEvent => closeEvent.reason === "Harmless error",
});
```

If this returns false, then the `SturdyWebSocket` is closed and `onclose` is
called with the latest `CloseEvent`. If this returns a promise, then the socket
waits for that promise to resolve to a boolean before either attempting to
reconnect or closing.

#### `wsConstructor`

Default: `WebSocket`

Constructor used for creating WebSockets internally. Can be used to specify an
implementation for the underlying WebSockets other than the default. This may be
useful in environments where `WebSocket` is not available as a global variable,
such as Node.js.

If this option is not provided and there is no variable named `WebSocket` in the
global scope, then the `SturdyWebSocket` constructor will throw.

### Additional Methods

#### `reconnect()`

Closes the backing websocket and opens a new one. This will immediately call the
[`down` handler](#down) with no event, followed by the [`reopen`
handler](#reopen) once the connection is reestablished.

This is a useful method because the WebSocket protocol alone is not always
enough to detect a failed connection. If you detect that this has occurred, for
example by noticing that your messages sent do not receive a response, then you
should manually call `reconnect()` to force a new connection to be created. See
the [Caveats](#caveats) section for details.

### Additional Events

These events, like all the standard WebSocket events, can be observed in two
ways:

```js
ws.onreopen = () => console.log("We're back!");
ws.addEventListener("reopen", () => console.log("We're back!"));
```

#### `down`

Called when the backing WebSocket is closed but `SturdyWebSocket` will try to
reconnect. Recieves the `CloseEvent` of the backing WebSocket. If this was
triggered by a call to [`reconnect()`](#reconnect), then the event will be
`undefined`.

#### `reopen`

Called when the backing WebSocket is reopened after it closed.

Copyright © 2017 David Philipson
