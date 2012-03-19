(function() {
  var exit, localTime, log, matchesGlobs, minimatch, npmVersion, parseArgs, path, spawn, substitutePath, usage, watch, _ref;
  path = require('path');
  spawn = require('child_process').spawn;
  minimatch = require('minimatch');
  _ref = require('./support'), parseArgs = _ref.parseArgs, npmVersion = _ref.npmVersion, log = _ref.log, localTime = _ref.localTime, exit = _ref.exit, matchesGlobs = _ref.matchesGlobs;
  watch = require('./wach');
  this.run = function(rawArgs) {
    var args, command, commandRunning, cwd, help, only, version, _ref2;
    args = parseArgs(rawArgs);
    _ref2 = parseArgs(rawArgs), help = _ref2.help, version = _ref2.version, command = _ref2.command, only = _ref2.only;
    if (args.help != null) {
      exit(0, usage);
    }
    if (args.version != null) {
      exit(0, npmVersion());
    }
    if (args.command == null) {
      exit(1, usage);
    }
    log.info("Will run: " + args.command);
    if (args.only.length === 0) {
      log.info("when any files added or updated");
    } else {
      log.info("when files matching {" + (args.only.join(',')) + "} added or updated");
    }
    if (args.except.length !== 0) {
      log.info("except those matching {" + (args.except.join(',')) + "}");
    }
    commandRunning = false;
    cwd = process.cwd();
    return watch(cwd, function(changedPath) {
      var child, commandWithPathSubsitution;
      changedPath = path.relative(cwd, changedPath);
      if (commandRunning) {
        return;
      }
      if (!path.existsSync(changedPath)) {
        return;
      }
      if ((args.only.length !== 0) && (!matchesGlobs(changedPath, args.only))) {
        return;
      }
      if ((args.except.length !== 0) && (matchesGlobs(changedPath, args.except))) {
        return;
      }
      commandWithPathSubsitution = substitutePath(args.command, changedPath);
      log.info("");
      log.info("changed: " + changedPath + " (" + (localTime()) + ")");
      log.info("running: " + commandWithPathSubsitution);
      log.info("");
      child = spawn('sh', ['-c', commandWithPathSubsitution]);
      commandRunning = true;
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
      return child.on('exit', function(code) {
        return commandRunning = false;
      });
    });
  };
  substitutePath = function(command, path) {
    return command.replace('{}', path);
  };
  usage = "Run a command every when file changes occur in the current directory. If\nthe command you want to run is a long running process like a web server\nsee `wachs`\n\nUsage:\n  wach [options] <command>\n\nRequired:\n  <command>\n    Run every time an update occurs in the directory being monitored.\n    If the command includes `{}` it will be subsituted for the path that changed.\n\nOptions:\n  -o|--only <globs>\n    Only run <command> when the path that changed matches <globs>.\n\n  -e|--except <globs>\n    Only run <command> when the path that changed doesn't match <globs>.\n\n  Quote the <globs> (\"*.c\") or add a trailing comma (*.c,) to prevent your shell from\n  automatically expanding  them.\n\nExamples:\n  wach make\n  wach -o *.c, make\n  wach -o *.coffee, coffee {}\n  TEST_DIR=generators wach -o **/*.rb, bundle exec rake test";
}).call(this);