// parser\tests\parser.test.ts
import { MarkdownParser } from '../src';

describe('MarkdownParser', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  it('should parse h1 heading', () => {
    const markdown = '# Hello World';
    const html = parser.render(markdown);
    expect(html).toBe('<h1>Hello World</h1>');
  });
});

describe('List Parsing', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  it('should parse unordered list with dash', () => {
    const markdown = '- item 1\n- item 2';
    const html = parser.render(markdown);
    expect(html).toBe('<ul><li>item 1</li><li>item 2</li></ul>');
  });

  it('should parse unordered list with asterisk', () => {
    const markdown = '* item 1\n* item 2';
    const html = parser.render(markdown);
    expect(html).toBe('<ul><li>item 1</li><li>item 2</li></ul>');
  });

  it('should parse ordered list', () => {
    const markdown = '1. item 1\n2. item 2';
    const html = parser.render(markdown);
    expect(html).toBe('<ol><li>item 1</li><li>item 2</li></ol>');
  });

  it('should parse mixed content in list items', () => {
    const markdown = '- **bold** item\n- *italic* item';
    const html = parser.render(markdown);
    expect(html).toBe('<ul><li><strong>bold</strong> item</li><li><em>italic</em> item</li></ul>');
  });
});
