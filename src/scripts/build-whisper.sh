set -e

cd lib/whisper.cpp
cmake-js compile -T addon.node -B Release

# this is for macos
if [[ "$(uname)" == "Darwin" ]]; then
  install_name_tool -add_rpath @loader_path/ build/Release/addon.node.node
fi

# this is for linux (untested)
if [[ "$(uname)" == "Linux" ]]; then
  patchelf --set-rpath '$ORIGIN' build/Release/addon.node.node
fi
