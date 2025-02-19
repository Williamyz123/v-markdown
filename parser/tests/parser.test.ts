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
