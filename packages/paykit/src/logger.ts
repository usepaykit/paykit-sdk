import chalk from 'chalk';

export interface LoggerOptions {
  silent?: boolean;
  verbose?: boolean;
}

export class Logger {
  private silent: boolean;
  private verbose: boolean;

  constructor(options: LoggerOptions = {}) {
    this.silent = options.silent || false;
    this.verbose = options.verbose || false;
  }

  /**
   * Success messages (green)
   */
  success(message: string) {
    if (this.silent) return;
    console.log(chalk.green(`✔ ${message}`));
  }

  /**
   * Info messages (blue)
   */
  info(message: string) {
    if (this.silent) return;
    console.log(chalk.blue(`ℹ ${message}`));
  }

  /**
   * Warning messages (yellow)
   */
  warn(message: string) {
    if (this.silent) return;
    console.log(chalk.yellow(`⚠ ${message}`));
  }

  /**
   * Error messages (red)
   */
  error(message: string) {
    if (this.silent) return;
    console.error(chalk.red(`✖ ${message}`));
  }

  /**
   * Debug messages (gray, only in verbose mode)
   */
  debug(message: string) {
    if (this.silent || !this.verbose) return;
    console.log(chalk.gray(`🔍 ${message}`));
  }

  /**
   * Tip messages (cyan)
   */
  tip(message: string) {
    if (this.silent) return;
    console.log(chalk.cyan(`💡 ${message}`));
  }

  /**
   * Code block styling
   */
  code(code: string) {
    if (this.silent) return;
    console.log(chalk.bgGray.white(` ${code} `));
  }

  /**
   * Section headers
   */
  section(title: string) {
    if (this.silent) return;
    console.log(chalk.bold.underline(`\n${title}`));
  }

  /**
   * Progress indicator
   */
  progress(message: string) {
    if (this.silent) return;
    process.stdout.write(chalk.blue(`⏳ ${message}... `));
  }

  /**
   * Clear progress line
   */
  clearProgress() {
    if (this.silent) return;
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }

  /**
   * Table-like output for key-value pairs
   */
  table(data: Record<string, string>) {
    if (this.silent) return;
    const maxKeyLength = Math.max(...Object.keys(data).map(k => k.length));

    Object.entries(data).forEach(([key, value]) => {
      const paddedKey = key.padEnd(maxKeyLength);
      console.log(chalk.gray(`${paddedKey}: `) + chalk.white(value));
    });
  }

  /**
   * List items
   */
  list(items: string[], bullet = '•') {
    if (this.silent) return;
    items.forEach(item => {
      console.log(chalk.gray(`${bullet} `) + chalk.white(item));
    });
  }

  /**
   * Divider line
   */
  divider(char = '─', length = 50) {
    if (this.silent) return;
    console.log(chalk.gray(char.repeat(length)));
  }

  /**
   * Spacer
   */
  spacer(lines = 1) {
    if (this.silent) return;
    for (let i = 0; i < lines; i++) {
      console.log('');
    }
  }
}

export const logger = new Logger();
