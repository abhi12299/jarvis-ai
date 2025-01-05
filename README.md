# Jarvis AI

## What is this?

An electron app which should be able to do the following:

- AI dictation (similar to Superwhisper or Wispr Flow)
- Support function calling
- Context aware (at least on MacOS - don't know how to do yet.)

> This is aimed at being fully open source and allowing user to choose which AI models they want to use.

Currently, this app uses:

- Whisper.cpp - for speech to text
- Groq - AI integration (not implemented yet)

This is in active development, and currently I'm only targeting MacOS.

## How to run

Only tested on MacOS. You need:

- Nodejs
- pnpm
- cmake
- python3
- Xcode

During development:

```bash
pnpm install
```

```bash
pnpm start
```

To package the app:

```bash
pnpm package
```
