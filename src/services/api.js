// src/services/api.js - VERSIÓN SIMPLIFICADA SIN PROBLEMAS
const API_BASE_URL = 'http://localhost:8000/api/v1';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('APIService initialized with baseURL:', this.baseURL);
  }

  async uploadFile(file, title = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title) {
        formData.append('title', title);
      }

      console.log('Uploading file to:', `${this.baseURL}/upload/upload-file`);

      const response = await fetch(`${this.baseURL}/upload/upload-file`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  }

  async uploadText(content, title = null) {
    try {
      console.log('Uploading text to:', `${this.baseURL}/upload/upload-text`);

      const response = await fetch(`${this.baseURL}/upload/upload-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          title
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in uploadText:', error);
      throw error;
    }
  }

  async generateSummary(text, length = 'medium') {
    try {
      console.log('Generating summary...');

      const response = await fetch(`${this.baseURL}/summary/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          length
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in generateSummary:', error);
      throw error;
    }
  }

  async generateVisualization(text) {
    try {
      console.log('Generating visualization...');

      const response = await fetch(`${this.baseURL}/summary/generate-visualization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in generateVisualization:', error);
      throw error;
    }
  }

  async generateQuiz(text, numQuestions = 5, difficulty = 'medium') {
    try {
      console.log('Generating quiz...');

      const response = await fetch(`${this.baseURL}/quiz/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          num_questions: numQuestions,
          difficulty
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in generateQuiz:', error);
      throw error;
    }
  }

  async submitQuiz(sessionId, answers) {
    try {
      console.log('Submitting quiz...');

      const response = await fetch(`${this.baseURL}/quiz/submit-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          answers
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in submitQuiz:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const healthURL = this.baseURL.replace('/api/v1', '') + '/health';
      console.log('Health check URL:', healthURL);
      
      const response = await fetch(healthURL);
      return await response.json();
    } catch (error) {
      console.error('Error in healthCheck:', error);
      throw error;
    }
  }
}

export default new APIService();