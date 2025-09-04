import chalk from 'chalk';

export interface LoggerOptions {
  silent?: boolean;
  verbose?: boolean;
}

export class Logger {
  private silent: boolean;
  private verbose: boolean;

  // Design system colors
  private colors = {
    success: '#166534', // Dark green for success messages
    info: '#15803d', // Green for info messages
    warning: '#d97706', // Amber for warnings
    error: '#dc2626', // Red for errors
    tip: '#16a34a', // Green for tips
    brand: '#166534', // Dark green for brand
    divider: '#16a34a', // Green for dividers
    question: '#16a34a', // Green for questions
    answer: '#6b7280', // Gray for answers
    progress: '#15803d', // Green for progress
  };

  constructor(options: LoggerOptions = {}) {
    this.silent = options.silent || false;
    this.verbose = options.verbose || false;
  }

  /**
   * Success messages (dark green)
   */
  success(message: string) {
    if (this.silent) return;
    console.log(chalk.hex(this.colors.success)(`✔ ${message}`));
  }

  /**
   * Info messages (green)
   */
  info(message: string) {
    if (this.silent) return;
    console.log(chalk.hex(this.colors.info)(`ℹ ${message}`));
  }

  /**
   * Warning messages (amber)
   */
  warn(message: string) {
    if (this.silent) return;
    console.log(chalk.hex(this.colors.warning)(`⚠ ${message}`));
  }

  /**
   * Error messages (red)
   */
  error(message: string) {
    if (this.silent) return;
    console.error(chalk.hex(this.colors.error)(`✖ ${message}`));
  }

  /**
   * Debug messages (gray, only in verbose mode)
   */
  debug(message: string) {
    if (this.silent || !this.verbose) return;
    console.log(chalk.gray(`🔍 ${message}`));
  }

  /**
   * Tip messages (green)
   */
  tip(message: string) {
    if (this.silent) return;
    console.log(chalk.hex(this.colors.tip)(`💡 ${message}`));
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
    console.log(chalk.hex(this.colors.brand).bold.underline(`\n${title}`));
  }

  /**
   * Progress indicator (deprecated - use progressIndicator instead)
   */
  progress(message: string) {
    if (this.silent) return;
    this.progressIndicator(message);
  }

  /**
   * Clear progress line (no-op since we don't use spinners anymore)
   */
  clearProgress() {
    if (this.silent) return;
    // No-op since we don't use spinners anymore
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
      console.log(chalk.hex(this.colors.tip)(`${bullet} `) + chalk.white(item));
    });
  }

  /**
   * Divider line
   */
  divider(char = '─', length = 50) {
    if (this.silent) return;
    console.log(chalk.hex(this.colors.divider)(char.repeat(length)));
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
   * Brand header with ASCII art
   */
  brand() {
    if (this.silent) return;

    // Simple ASCII art for "PAYKIT"
    const asciiArt = `
██████╗  █████╗ ██╗   ██╗██╗  ██╗██╗████████╗
██╔══██╗██╔══██╗╚██╗ ██╔╝██║ ██╔╝██║╚══██╔══╝
██████╔╝███████║ ╚████╔╝ █████╔╝ ██║   ██║   
██╔═══╝ ██╔══██║  ╚██╔╝  ██╔═██╗ ██║   ██║   
██║     ██║  ██║   ██║   ██║  ██╗██║   ██║   
╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝   ╚═╝   
    `.trim();

    console.log(chalk.hex(this.colors.brand).bold(asciiArt));
    this.divider();
  }

  /**
   * Welcome message
   */
  welcome(message: string) {
    if (this.silent) return;
    console.log(chalk.white(message));
  }

  /**
   * Interactive question with green diamond
   */
  question(message: string) {
    if (this.silent) return;
    console.log(chalk.hex(this.colors.question)('◇') + ' ' + chalk.white(message));
  }

  /**
   * Selected answer with indentation and gray color
   */
  answer(value: string, indent = 2) {
    if (this.silent) return;
    const indentStr = ' '.repeat(indent);
    console.log(indentStr + chalk.hex(this.colors.answer)(value));
  }

  /**
   * Progress indicator with green circle
   */
  progressIndicator(message: string) {
    if (this.silent) return;
    console.log(chalk.hex(this.colors.progress)('•') + ' ' + chalk.white(message));
  }

  /**
   * Interactive setup step
   */
  setupStep(question: string, answer: string, isLast = false) {
    if (this.silent) return;

    // Show question with green diamond
    this.question(question);

    // Show answer with indentation
    this.answer(answer);

    // Add connecting line if not the last step
    if (!isLast) {
      console.log(chalk.gray('│'));
    }
  }
}

export const logger = new Logger();
