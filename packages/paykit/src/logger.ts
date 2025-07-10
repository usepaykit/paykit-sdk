import chalk from 'chalk';

export interface LoggerOptions {
  silent?: boolean;
  verbose?: boolean;
}

export class Logger {
  private silent: boolean;
  private verbose: boolean;
  private spinnerInterval: NodeJS.Timeout | null = null;
  private spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private currentSpinnerFrame = 0;

  constructor(options: LoggerOptions = {}) {
    this.silent = options.silent || false;
    this.verbose = options.verbose || false;
  }

  /**
   * Success messages (dark green)
   */
  success(message: string) {
    if (this.silent) return;
    console.log(chalk.hex('#166534')(`✔ ${message}`));
  }

  /**
   * Info messages (dark green)
   */
  info(message: string) {
    if (this.silent) return;
    console.log(chalk.hex('#15803d')(`ℹ ${message}`));
  }

  /**
   * Warning messages (amber)
   */
  warn(message: string) {
    if (this.silent) return;
    console.log(chalk.hex('#d97706')(`⚠ ${message}`));
  }

  /**
   * Error messages (red)
   */
  error(message: string) {
    if (this.silent) return;
    console.error(chalk.hex('#dc2626')(`✖ ${message}`));
  }

  /**
   * Debug messages (gray, only in verbose mode)
   */
  debug(message: string) {
    if (this.silent || !this.verbose) return;
    console.log(chalk.gray(`🔍 ${message}`));
  }

  /**
   * Tip messages (dark green)
   */
  tip(message: string) {
    if (this.silent) return;
    console.log(chalk.hex('#16a34a')(`💡 ${message}`));
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
    console.log(chalk.hex('#166534').bold.underline(`\n${title}`));
  }

  /**
   * Progress indicator with spinning animation
   */
  progress(message: string) {
    if (this.silent) return;

    // Clear any existing spinner
    this.stopSpinner();

    // Start the spinning animation
    this.startSpinner(message);
  }

  /**
   * Start the spinner animation
   */
  private startSpinner(message: string) {
    const updateSpinner = () => {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      const spinner = this.spinnerFrames[this.currentSpinnerFrame];
      process.stdout.write(chalk.hex('#15803d')(`${spinner} ${message}... `));
      this.currentSpinnerFrame = (this.currentSpinnerFrame + 1) % this.spinnerFrames.length;
    };

    // Initial display
    updateSpinner();

    // Update every 80ms for smooth animation
    this.spinnerInterval = setInterval(updateSpinner, 80);
  }

  /**
   * Stop the spinner animation
   */
  private stopSpinner() {
    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
      this.spinnerInterval = null;
    }
  }

  /**
   * Clear progress line
   */
  clearProgress() {
    if (this.silent) return;
    this.stopSpinner();
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
      console.log(chalk.hex('#16a34a')(`${bullet} `) + chalk.white(item));
    });
  }

  /**
   * Divider line
   */
  divider(char = '─', length = 50) {
    if (this.silent) return;
    console.log(chalk.hex('#16a34a')(char.repeat(length)));
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

  /**
   * Brand header
   */
  brand() {
    if (this.silent) return;
    console.log(chalk.hex('#166534').bold('PayKit CLI'));
    this.divider();
  }
}

export const logger = new Logger();
