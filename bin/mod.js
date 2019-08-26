#!/usr/bin/env node

let fs = require('fs')
let { join } = require('path')
let { promisify } = require('util')
let child_process = require('child_process')
let meow = require('meow')
let chalk = require('chalk')
let ora = require('ora')

let copyFile = promisify(fs.copyFile)
let mkdir = promisify(fs.mkdir)
let exec = promisify(child_process.exec)

const SRC_PATH = join(__dirname, '../copy-paste')

const MODULES = [
  'cssnano@4',
  'postcss@7',
  'postcss-calc@7',
  'postcss-import@12',
  'postcss-object-fit-images@1',
  'postcss-preset-env@6'
]

/*
  TODO

  - [x] $ depre list-deps (just print MODULES)
  - [ ] $ depre copy <module name> [options]
  - [ ] $ depre make <module name> [options]
  - [ ] finish help
*/

let program = meow(`
  $ depre --help

  ${chalk.red('DEPRECATED CSS')}

  This little CLI tool does two things:

  (1) copy the following files:
    - global.css         (into --src-dest)
    - main.css           (into --src-dest)
    - variables.css      (into --src-dest)
    - webfonts.css       (into --src-dest)
    - postcss.config.js  (into ./)

  (2) install some "npm" dependencies:
    - cssnano@4
    - postcss@7
    - postcss-calc@7
    - postcss-import@12
    - postcss-object-fit-images@1
    - postcss-preset-env@6

  ${chalk.magenta('Usage')}
    $ depre [options]

  ${chalk.magenta('Options')}
    -d --src-dest  The destination folder for copying files [./src/styles] 
    -f --force     Overwrite files if they exist [false]
    -y --yarn      Use yarn insteaf of npm [false]
`, {
  flags: {
    srcDest: {
      type: 'string',
      alias: 'd',
      default: './src/styles'
    },
    force: {
      type: 'boolean',
      alias: 'f',
      default: false
    },
    yarn: {
      type: 'boolean',
      alias: 'y',
      default: false
    }
  }
})

main()

async function main () {
  let command = program.input[0]

  try {
    if (!command) {
      await copyFiles()
      await installDeps()
    } else {
      if (command === 'list-deps') {
        console.log(MODULES)
      }
      if (command === 'make') {
        // TODO
      }
      if (command === 'copy') {
        // 
      }
    }
  } catch (err) {
    return exit(err.message)
  }
  exit()
}

async function copyFiles () {
  let { srcDest } = program.flags
  let cwd = process.cwd()
  let spinner = ora('Copying files').start()
  try {
    await mkdir(join(cwd, srcDest), { recursive: true })
    await Promise.all([
      copy(
        join(SRC_PATH, 'global.css'),
        join(cwd, srcDest, 'global.css')
      ),
      copy(
        join(SRC_PATH, 'main.css'),
        join(cwd, srcDest, 'main.css')
      ),
      copy(
        join(SRC_PATH, 'variables.css'),
        join(cwd, srcDest, 'variables.css')
      ),
      copy(
        join(SRC_PATH, 'webfonts.css'),
        join(cwd, srcDest, 'webfonts.css')
      ),
      copy(
        join(SRC_PATH, 'postcss.config.js'),
        join(cwd, 'postcss.config.js')
      )
    ])
  } catch (err) {
    spinner.fail()
    return Promise.reject(err)
  }
  spinner.succeed('Files copied')
  return Promise.resolve()
}

function copy (src, dest) {
  let { force } = program.flags
  return copyFile(src, dest, force ? 0 : fs.constants.COPYFILE_EXCL)
}

async function installDeps () {
  let { yarn } = program.flags
  let spinner = ora('Installing dependencies, please wait').start()
  let command = yarn ? 'yarn add -D --no-progress ' : 'npm install -D '
  try {
    await exec(command + MODULES.join(' '))
  } catch (err) {
    spinner.fail()
    return Promise.reject(err)
  }
  spinner.succeed('Dependencies installed')
  return Promise.resolve()
}

function exit (message) {
  if (message) {
    console.error(message)
    return process.exit(1)
  }

  process.exit(0)
}
