RemoteJS
========

<img align="right" src="http://i.imgur.com/P8PKWRE.png" title="RemoteJS app" alt="RemoteJS app" />

RemoteJS is a Node.js application to allow you to control your music just from your browser !
At the time of writing this, this is just a proof of concept and it only works with iTunes.

RemoteJS has been designed to be used through plugins. You just need to edit `config.yaml` to enable the plugins you want. The only plugins that currently exists is iTunes plugin, to let you manage your iTunes music.

RemoteJS has been also designed to be used on any existing device. The interface is responsive and can adjust to the device resolution.

###iTunes configuration

Edit `config.yaml` to add these lines :

```yaml
path: "./plugins/itunes/itunes.js" # Path to the plugin

# node-daap stuff - https://github.com/j-muller/node-daap
host: '127.0.0.1' # IP address where iTunes is started
port: 3689 # DAAP protocol port
pairingCode: '' # Use this tool to get your pairing code : https://github.com/j-muller/PairingJS
```

__This is currently only a BETA version, so if you need further information, contact me or clone and fork this repository__

###License

RemoteJS is freely distributable under the terms of the MIT license.

```
Copyright (c) 2012 - 2013 Jeffrey Muller <jeffrey.muller92@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
