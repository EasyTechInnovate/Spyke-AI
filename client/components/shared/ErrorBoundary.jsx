'use client'

import { Component } from 'react'
import { AlertCircle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4">We encountered an error loading this page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-text rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}