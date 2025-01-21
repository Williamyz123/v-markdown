export function calculatePosition(content: string, offset: number) {
  const textBeforeOffset = content.slice(0, offset);
  const lines = textBeforeOffset.split('\n');

  return {
    line: lines.length - 1,
    column: lines[lines.length - 1].length,
    offset
  };
}
