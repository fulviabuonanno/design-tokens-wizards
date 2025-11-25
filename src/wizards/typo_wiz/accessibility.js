import inquirer from 'inquirer';
import chalk from 'chalk';

export async function showAccessibilityNotes(propertyType) {
  const { showNotes } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'showNotes',
      message: '📝 Would you like to see ' + chalk.underline('accessibility guidelines') + ' for this typography property?\n>>>',
      default: false
    }
  ]);

  console.log(chalk.bold.bgRedBright("\n========================================\n"));

  if (showNotes) {
    console.log(''); 
    switch (propertyType) {
      case 'fontFamily':
        console.log(chalk.bold.yellow("⚠️ ACCESSIBILITY NOTE ABOUT FONT FAMILIES:"));
        console.log(chalk.yellow("For optimal readability and accessibility:"));
        console.log(chalk.yellow("• Choose fonts with clear letterforms and good character distinction"));
        console.log(chalk.yellow("• Sans-serif fonts are generally more readable on screens"));
        console.log(chalk.yellow("• Ensure fonts support all required characters and languages"));
        console.log(chalk.yellow("• Some users may override your font choices with their system fonts"));
        console.log(chalk.yellow("• Always provide at least one system font fallback"));
        console.log(chalk.yellow("• Consider using system font stacks for better performance"));
        console.log(chalk.yellow("• Dyslexia-friendly fonts: ") + chalk.underline("OpenDyslexic, Lexia Readable, Comic Sans MS"));
        console.log(chalk.yellow("• Avoid using more than 2-3 different font families in your design"));
        break;
      
      case 'fontSize':
        console.log(chalk.bold.yellow("⚠️ ACCESSIBILITY NOTE ABOUT FONT SIZES:"));
        console.log(chalk.yellow("For optimal readability and accessibility:"));
        console.log(chalk.yellow("• Body text should ideally be at least 16px"));
        console.log(chalk.yellow("• Text smaller than 12px should be avoided in most cases"));
        console.log(chalk.yellow("• Small font sizes should only be used for supplementary content"));
        console.log(chalk.yellow("• Consider users with visual impairments when defining your scale"));
        break;
      
      case 'fontWeight':
        console.log(chalk.bold.yellow("⚠️  ACCESSIBILITY NOTE ABOUT FONT WEIGHTS:"));
        console.log(chalk.yellow("For optimal readability and accessibility:"));
        console.log(chalk.yellow("• Ensure sufficient contrast between text and background"));
        console.log(chalk.yellow("• Body text should be at least 400 (regular) weight"));
        console.log(chalk.yellow("• Avoid using font weights below 400 for main content"));
        console.log(chalk.yellow("• Headers typically benefit from weights of 600 or higher"));
        console.log(chalk.yellow("• Not all fonts support all weight values"));
        console.log(chalk.yellow("• Test font weights across different browsers and devices"));
        break;
      
      case 'letterSpacing':
        console.log(chalk.bold.yellow("⚠️  ACCESSIBILITY NOTE ABOUT LETTER SPACING:"));
        console.log(chalk.yellow("For optimal readability and accessibility:"));
        console.log(chalk.yellow("• Avoid extreme letter spacing values that could harm readability"));
        console.log(chalk.yellow("• Body text should maintain normal letter spacing (0) or very subtle adjustments"));
        console.log(chalk.yellow("• Decorative text (headings, display) can have more pronounced spacing"));
        console.log(chalk.yellow("• Users with dyslexia may struggle with increased letter spacing"));
        console.log(chalk.yellow("• Ensure sufficient contrast and clear letterforms remain visible"));
        break;
      
      case 'lineHeight':
        console.log(chalk.bold.yellow("⚠️  ACCESSIBILITY NOTE ABOUT LINE HEIGHT:"));
        console.log(chalk.yellow("For optimal readability and accessibility:"));
        console.log(chalk.yellow("• Body text should have a minimum line height of 1.5"));
        console.log(chalk.yellow("• Headings should have a minimum line height of 1.3"));
        console.log(chalk.yellow("• Line height should increase as line length increases"));
        console.log(chalk.yellow("• Users with dyslexia or visual impairments benefit from increased line spacing"));
        console.log(chalk.yellow("• Avoid line heights below 1.2 as they can reduce readability"));
        console.log(chalk.yellow("• WCAG 2.2 Success Criterion 1.4.12 requires adjustable line spacing up to 1.5"));
        break;
    }
    console.log(''); 
  }
}
