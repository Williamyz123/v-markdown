// cypress/e2e/editor/basic.cy.js
/* eslint-disable no-undef */

describe('Markdown Editor Basic Functionality', () => {
  beforeEach(() => {
    // 每个测试前访问编辑器页面
    cy.visit('http://localhost:3000')
  })

  it('should render editor components', () => {
    // 检查基本组件是否渲染
    cy.get('.markdown-editor').should('exist')
    cy.get('.editor-toolbar').should('exist')
    cy.get('.edit-area').should('exist')
    cy.get('.preview-area').should('exist')
  })

  describe('Basic Markdown syntax', () => {
    it('should render headings', () => {
      // 输入标题文本
      cy.get('.edit-area textarea').clear().type('# Heading 1')

      // 打印预览区域的HTML内容以进行调试
      cy.get('.preview-area').invoke('html').then(html => {
        cy.log('Preview area HTML:', html)
      })

      // 检查元素是否存在及其内容
      cy.get('.preview-area').should('exist')
      cy.get('.preview-area').contains('Heading 1')
    })

    it('should render text formatting', () => {
      // 输入格式化文本
      cy.get('.edit-area textarea').clear()
        .type('**Bold Text**\n')
        .type('*Italic Text*\n')
        .type('~~Strikethrough Text~~')

      // 检查预览区域的文本格式
      cy.get('.preview-area strong').should('have.text', 'Bold Text')
      cy.get('.preview-area em').should('have.text', 'Italic Text')
      cy.get('.preview-area del').should('have.text', 'Strikethrough Text')
    })

    it('should render lists', () => {
      // 输入列表文本
      cy.get('.edit-area textarea').clear()
        .type('- Unordered item 1\n')
        .type('- Unordered item 2\n\n')
        .type('1. Ordered item 1\n')
        .type('2. Ordered item 2')

      // 检查预览区域的列表渲染
      cy.get('.preview-area ul li').should('have.length', 2)
      cy.get('.preview-area ol li').should('have.length', 2)
    })

    it('should render blockquotes', () => {
      // 输入引用文本
      cy.get('.edit-area textarea').clear()
        .type('> This is a blockquote')

      // 检查预览区域的引用渲染
      cy.get('.preview-area blockquote').should('exist')
        .should('contain', 'This is a blockquote')
    })
  })

  describe('Toolbar functionality', () => {
    it('should apply bold formatting', () => {
      // 输入并选择文本
      cy.get('.edit-area textarea').clear().type('test text')
      cy.get('.edit-area textarea').type('{selectall}')

      // 点击加粗按钮
      cy.get('button[title*="加粗"]').click()

      // 验证结果
      cy.get('.edit-area textarea').should('have.value', '**test text**')
      cy.get('.preview-area strong').should('have.text', 'test text')
    })

    it('should apply italic formatting', () => {
      // 输入并选择文本
      cy.get('.edit-area textarea').clear().type('test text')
      cy.get('.edit-area textarea').type('{selectall}')

      // 点击斜体按钮
      cy.get('button[title*="斜体"]').click()

      // 验证结果
      cy.get('.edit-area textarea').should('have.value', '*test text*')
      cy.get('.preview-area em').should('have.text', 'test text')
    })

    it('should create headings using toolbar', () => {
      // 输入并选择文本
      cy.get('.edit-area textarea').clear().type('test heading')
      cy.get('.edit-area textarea').type('{selectall}')

      // 点击标题按钮
      cy.get('button[title="一级标题"]').click()

      // 验证结果
      cy.get('.preview-area h1').should('exist')
        .should('have.text', ' test heading')
    })
  })

  describe('Theme switching', () => {
    it('should switch editor themes', () => {
      // 切换到深色主题
      cy.get('select.theme-select').select('dark')
      cy.get('.markdown-editor').should('have.attr', 'data-theme', 'dark')

      // 切换回浅色主题
      cy.get('select.theme-select').select('light')
      cy.get('.markdown-editor').should('have.attr', 'data-theme', 'light')
    })

    it('should switch code themes', () => {
      // 输入代码块
      cy.get('.edit-area textarea').clear()
        .type('```javascript\nconst test = "hello";\n```')

      // 切换代码主题
      cy.get('select.code-theme-select').select('monokai')
      cy.get('.preview-area pre').should('have.attr', 'data-code-theme', 'monokai')

      cy.get('select.code-theme-select').select('github')
      cy.get('.preview-area pre').should('have.attr', 'data-code-theme', 'github')
    })
  })

  describe('Local storage', () => {
    it('should save content to local storage', () => {
      const testContent = '# Test Content'

      // 输入内容
      cy.get('.edit-area textarea').clear().type(testContent)

      // 等待自动保存（延迟1000ms）
      cy.wait(1100)

      // 刷新页面
      cy.reload()

      // 验证内容是否保持
      cy.get('.edit-area textarea').should('have.value', testContent)
    })
  })

  describe('Export functionality', () => {
    it('should have export buttons', () => {
      cy.get('button[title*="导出为HTML"]').should('exist')
      cy.get('button[title*="导出为PDF"]').should('exist')
    })

    it('should export HTML', () => {
      // 输入测试内容
      cy.get('.edit-area textarea').clear()
        .type('# Test Export\n\nThis is a test.')

      // 点击导出按钮
      cy.get('button[title*="导出为HTML"]').click()

    })
  })
})
