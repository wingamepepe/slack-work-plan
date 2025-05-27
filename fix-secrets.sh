#!/bin/bash

# 替换 ENV_CONFIG_GUIDE.md 中的敏感信息
if [ -f ENV_CONFIG_GUIDE.md ]; then
    sed -i.bak 's/xoxb-[0-9]*-[0-9]*-[a-zA-Z]*/xoxb-YOUR-BOT-TOKEN-HERE/g' ENV_CONFIG_GUIDE.md
    sed -i.bak 's/[a-f0-9]\{32\}/YOUR-SIGNING-SECRET-HERE/g' ENV_CONFIG_GUIDE.md
    rm -f ENV_CONFIG_GUIDE.md.bak
fi

# 替换 SLASH_COMMAND_SETUP.md 中的敏感信息
if [ -f SLASH_COMMAND_SETUP.md ]; then
    sed -i.bak 's/xoxb-[0-9]*-[0-9]*-[a-zA-Z]*/xoxb-YOUR-BOT-TOKEN-HERE/g' SLASH_COMMAND_SETUP.md
    sed -i.bak 's/[a-f0-9]\{32\}/YOUR-SIGNING-SECRET-HERE/g' SLASH_COMMAND_SETUP.md
    rm -f SLASH_COMMAND_SETUP.md.bak
fi

# 删除 .env 文件（如果存在）
if [ -f .env ]; then
    rm .env
fi

git add -A 