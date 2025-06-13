#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Security test configuration
const SECURITY_TESTS = {
  sqlInjection: {
    name: 'SQL Injection Prevention',
    description: 'Check for dangerous SQL execution functions',
    critical: true
  },
  rlsPolicies: {
    name: 'Row Level Security Policies',
    description: 'Verify secure RLS policies are in place',
    critical: true
  },
  passwordValidation: {
    name: 'Password Strength Validation',
    description: 'Check password validation implementation',
    critical: false
  },
  rateLimiting: {
    name: 'Rate Limiting',
    description: 'Verify rate limiting middleware exists',
    critical: false
  },
  errorHandling: {
    name: 'Error Handling',
    description: 'Check comprehensive error handling system',
    critical: false
  }
}

class SecurityTester {
  constructor() {
    this.results = []
    this.criticalIssues = 0
    this.warnings = 0
  }

  log(level, message, details = '') {
    const timestamp = new Date().toISOString()
    const logEntry = { timestamp, level, message, details }
    this.results.push(logEntry)

    const icons = {
      PASS: '✅',
      WARN: '⚠️',
      FAIL: '🔴',
      INFO: 'ℹ️'
    }

    console.log(`${icons[level]} ${message}`)
    if (details) {
      console.log(`   ${details}`)
    }
  }

  checkFileExists(filePath, required = false) {
    const fullPath = path.join(__dirname, '..', filePath)
    const exists = fs.existsSync(fullPath)
    
    if (!exists && required) {
      this.log('FAIL', `Required file missing: ${filePath}`)
      this.criticalIssues++
      return false
    } else if (!exists) {
      this.log('WARN', `Optional file missing: ${filePath}`)
      this.warnings++
      return false
    } else {
      this.log('PASS', `File exists: ${filePath}`)
      return true
    }
  }

  checkFileContent(filePath, patterns, testName) {
    const fullPath = path.join(__dirname, '..', filePath)
    
    if (!fs.existsSync(fullPath)) {
      this.log('FAIL', `Cannot check ${testName}: ${filePath} not found`)
      this.criticalIssues++
      return false
    }

    const content = fs.readFileSync(fullPath, 'utf8')
    let allPassed = true

    patterns.forEach(({ pattern, required, description }) => {
      const found = pattern.test(content)
      
      if (required && !found) {
        this.log('FAIL', `${testName}: ${description} - Required pattern not found`)
        this.criticalIssues++
        allPassed = false
      } else if (!required && !found) {
        this.log('WARN', `${testName}: ${description} - Recommended pattern not found`)
        this.warnings++
      } else if (found) {
        this.log('PASS', `${testName}: ${description} - Found`)
      }
    })

    return allPassed
  }

  testSQLInjectionPrevention() {
    this.log('INFO', 'Testing SQL Injection Prevention...')
    
    // Check for dangerous patterns in codebase
    const dangerousPatterns = [
      { pattern: /exec_sql|execute_sql|run_sql/gi, required: false, description: 'No dangerous SQL execution functions' },
      { pattern: /query\s*\+\s*['"]/gi, required: false, description: 'No string concatenation in SQL queries' },
      { pattern: /\$\{.*\}/g, required: false, description: 'Template literals in SQL (potential injection)' }
    ]

    let hasIssues = false

    // Check specific files for SQL injection vulnerabilities
    const filesToCheck = [
      'app/api',
      'lib',
      'components'
    ]

    filesToCheck.forEach(dir => {
      const dirPath = path.join(__dirname, '..', dir)
      if (fs.existsSync(dirPath)) {
        this.scanDirectoryForPatterns(dirPath, dangerousPatterns, 'SQL Injection Check')
      }
    })

    // Check if security fixes file exists
    this.checkFileExists('SECURITY_FIXES.sql', true)
  }

  scanDirectoryForPatterns(dirPath, patterns, testName) {
    const files = this.getAllFiles(dirPath, ['.ts', '.tsx', '.js', '.jsx'])
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8')
      
      patterns.forEach(({ pattern, required, description }) => {
        if (pattern.test(content)) {
          const relativePath = path.relative(path.join(__dirname, '..'), file)
          if (description.includes('No dangerous')) {
            this.log('FAIL', `${testName}: Found dangerous pattern in ${relativePath}`)
            this.criticalIssues++
          } else {
            this.log('WARN', `${testName}: Found potential issue in ${relativePath}`)
            this.warnings++
          }
        }
      })
    })
  }

  getAllFiles(dirPath, extensions) {
    let files = []
    
    if (!fs.existsSync(dirPath)) {
      return files
    }

    const items = fs.readdirSync(dirPath)
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files = files.concat(this.getAllFiles(fullPath, extensions))
      } else if (stat.isFile()) {
        const ext = path.extname(item)
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    })
    
    return files
  }

  testPasswordValidation() {
    this.log('INFO', 'Testing Password Validation...')
    
    const patterns = [
      { pattern: /validatePassword/g, required: true, description: 'Password validation function exists' },
      { pattern: /length.*8/g, required: true, description: 'Minimum 8 character requirement' },
      { pattern: /uppercase/gi, required: true, description: 'Uppercase letter requirement' },
      { pattern: /lowercase/gi, required: true, description: 'Lowercase letter requirement' },
      { pattern: /number|digit/gi, required: true, description: 'Number requirement' },
      { pattern: /special.*character/gi, required: true, description: 'Special character requirement' }
    ]

    this.checkFileContent('lib/security/password-strength.ts', patterns, 'Password Validation')
  }

  testRateLimiting() {
    this.log('INFO', 'Testing Rate Limiting...')
    
    const patterns = [
      { pattern: /rate.*limit/gi, required: true, description: 'Rate limiting implementation' },
      { pattern: /middleware/gi, required: true, description: 'Middleware implementation' },
      { pattern: /429/g, required: true, description: 'HTTP 429 status code for rate limiting' }
    ]

    this.checkFileContent('middleware.ts', patterns, 'Rate Limiting')
  }

  testErrorHandling() {
    this.log('INFO', 'Testing Error Handling...')
    
    this.checkFileExists('lib/error-handler.ts', true)
    
    const patterns = [
      { pattern: /class.*Error.*extends/g, required: true, description: 'Custom error classes' },
      { pattern: /handleError/g, required: true, description: 'Error handling function' },
      { pattern: /ValidationError|AuthError|AppError/g, required: true, description: 'Specific error types' }
    ]

    this.checkFileContent('lib/error-handler.ts', patterns, 'Error Handling')
  }

  testSecureDatabase() {
    this.log('INFO', 'Testing Secure Database Implementation...')
    
    this.checkFileExists('lib/database/secure-client.ts', true)
    
    const patterns = [
      { pattern: /SecureDatabaseClient/g, required: true, description: 'Secure database client class' },
      { pattern: /validateInput/g, required: true, description: 'Input validation' },
      { pattern: /logSecurityEvent/g, required: true, description: 'Security event logging' }
    ]

    this.checkFileContent('lib/database/secure-client.ts', patterns, 'Secure Database')
  }

  generateReport() {
    this.log('INFO', 'Generating Security Report...')
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: Object.keys(SECURITY_TESTS).length,
        criticalIssues: this.criticalIssues,
        warnings: this.warnings,
        status: this.criticalIssues === 0 ? 'PASS' : 'FAIL'
      },
      results: this.results
    }

    // Write report to file
    const reportPath = path.join(__dirname, '..', 'security-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    console.log('\n' + '='.repeat(50))
    console.log('SECURITY TEST REPORT')
    console.log('='.repeat(50))
    console.log(`Status: ${report.summary.status}`)
    console.log(`Critical Issues: ${this.criticalIssues}`)
    console.log(`Warnings: ${this.warnings}`)
    console.log(`Report saved to: security-report.json`)
    console.log('='.repeat(50))

    if (this.criticalIssues > 0) {
      console.log('\n🔴 CRITICAL ISSUES FOUND!')
      console.log('Please address all critical issues before deploying to production.')
      process.exit(1)
    } else {
      console.log('\n✅ No critical security issues found!')
      if (this.warnings > 0) {
        console.log(`⚠️  ${this.warnings} warnings should be addressed when possible.`)
      }
    }
  }

  run() {
    console.log('🔒 Starting Security Test Suite...\n')
    
    // Run all security tests
    this.testSQLInjectionPrevention()
    this.testPasswordValidation()
    this.testRateLimiting()
    this.testErrorHandling()
    this.testSecureDatabase()
    
    // Generate final report
    this.generateReport()
  }
}

// Run the security test suite
const tester = new SecurityTester()
tester.run() 