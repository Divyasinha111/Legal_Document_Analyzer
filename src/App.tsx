import React, { useState, useCallback } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  Check, 
  Info, 
  Upload, 
  BarChart3, 
  Clock, 
  Trash2,
  ChevronRight,
  Calendar
} from 'lucide-react';

interface DocumentHistory {
  id: string;
  title: string;
  date: string;
  riskLevel: 'low' | 'medium' | 'high';
  type: 'pdf' | 'text';
  keyPoints: string[];
}

interface WeeklyAnalytics {
  documentsAnalyzed: number;
  riskLevels: {
    low: number;
    medium: number;
    high: number;
  };
  topKeyPoints: string[];
}

function App() {
  const [document, setDocument] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'history' | 'analytics'>('input');
  const [analysis, setAnalysis] = useState<null | {
    riskLevel: 'low' | 'medium' | 'high';
    keyPoints: string[];
    ethicalConsiderations: string[];
  }>(null);

  // Document history with state updater
  const [documentHistory, setDocumentHistory] = useState<DocumentHistory[]>([
    {
      id: '1',
      title: 'Employment Contract.pdf',
      date: '2024-03-10',
      riskLevel: 'low',
      type: 'pdf',
      keyPoints: ['Standard employment terms', 'Compensation details', 'Notice period']
    },
    {
      id: '2',
      title: 'NDA Agreement',
      date: '2024-03-09',
      riskLevel: 'medium',
      type: 'text',
      keyPoints: ['Confidentiality clauses', 'Term duration', 'Breach penalties']
    },
    {
      id: '3',
      title: 'Service Agreement.pdf',
      date: '2024-03-08',
      riskLevel: 'high',
      type: 'pdf',
      keyPoints: ['Complex liability terms', 'Jurisdiction issues', 'Payment disputes']
    }
  ]);

  // Weekly analytics with state updater
  const [weeklyAnalytics, setWeeklyAnalytics] = useState<WeeklyAnalytics>({
    documentsAnalyzed: 15,
    riskLevels: {
      low: 8,
      medium: 5,
      high: 2
    },
    topKeyPoints: [
      'Data Privacy Clauses',
      'Liability Limitations',
      'Payment Terms'
    ]
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setDocument(`Processing PDF: ${file.name}`);
    } else {
      alert('Please upload a valid PDF file');
    }
  }, []);

  // Function to extract key points based on document content
  const extractKeyPoints = (content: string): string[] => {
    const keyPoints: string[] = [];
    
    // Check for common legal terms and create relevant key points
    if (content.toLowerCase().includes('confidential')) {
      keyPoints.push('Contains confidentiality provisions');
    }
    if (content.toLowerCase().includes('terminate')) {
      keyPoints.push('Termination clauses present');
    }
    if (content.toLowerCase().includes('payment')) {
      keyPoints.push('Payment terms specified');
    }
    if (content.toLowerCase().includes('liability')) {
      keyPoints.push('Liability provisions included');
    }
    if (content.toLowerCase().includes('intellectual property')) {
      keyPoints.push('IP rights addressed');
    }
    
    // Add at least 3 key points if none were detected
    if (keyPoints.length < 3) {
      keyPoints.push('General legal provisions');
      keyPoints.push('Standard terms and conditions');
      keyPoints.push('Contract requirements outlined');
    }

    return keyPoints;
  };

  // Function to determine risk level based on content
  const determineRiskLevel = (content: string): 'low' | 'medium' | 'high' => {
    const lowRiskTerms = ['standard', 'basic', 'simple'];
    const highRiskTerms = ['terminate', 'lawsuit', 'dispute', 'penalty', 'violation'];
    
    const contentLower = content.toLowerCase();
    
    if (highRiskTerms.some(term => contentLower.includes(term))) {
      return 'high';
    } else if (lowRiskTerms.some(term => contentLower.includes(term))) {
      return 'low';
    }
    return 'medium';
  };

  const analyzeDocument = () => {
    const content = document || (pdfFile ? pdfFile.name : '');
    const keyPoints = extractKeyPoints(content);
    const riskLevel = determineRiskLevel(content);

    const newAnalysis = {
      riskLevel,
      keyPoints,
      ethicalConsiderations: [
        'AI analysis is supplementary and should not replace legal counsel',
        'Potential bias in automated analysis should be considered',
        'Results should be verified by qualified professionals'
      ]
    };

    setAnalysis(newAnalysis);

    // Add to document history
    const newDocument: DocumentHistory = {
      id: Date.now().toString(),
      title: pdfFile ? pdfFile.name : 'Text Document',
      date: new Date().toISOString().split('T')[0],
      riskLevel: newAnalysis.riskLevel,
      type: pdfFile ? 'pdf' : 'text',
      keyPoints: newAnalysis.keyPoints
    };

    const updatedHistory = [newDocument, ...documentHistory];
    setDocumentHistory(updatedHistory);

    // Update analytics
    const newAnalytics = {
      documentsAnalyzed: weeklyAnalytics.documentsAnalyzed + 1,
      riskLevels: {
        ...weeklyAnalytics.riskLevels,
        [riskLevel]: weeklyAnalytics.riskLevels[riskLevel] + 1
      },
      topKeyPoints: updateTopKeyPoints(keyPoints, weeklyAnalytics.topKeyPoints)
    };

    setWeeklyAnalytics(newAnalytics);
  };

  // Function to update top key points
  const updateTopKeyPoints = (newPoints: string[], existingPoints: string[]): string[] => {
    const allPoints = [...newPoints, ...existingPoints];
    const pointCount = new Map<string, number>();
    
    allPoints.forEach(point => {
      pointCount.set(point, (pointCount.get(point) || 0) + 1);
    });

    return Array.from(pointCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 3);
  };

  const handleDeleteDocument = (id: string) => {
    const documentToDelete = documentHistory.find(doc => doc.id === id);
    if (!documentToDelete) return;

    // Update history
    const updatedHistory = documentHistory.filter(doc => doc.id !== id);
    setDocumentHistory(updatedHistory);

    // Update analytics
    setWeeklyAnalytics(prev => ({
      documentsAnalyzed: prev.documentsAnalyzed - 1,
      riskLevels: {
        ...prev.riskLevels,
        [documentToDelete.riskLevel]: prev.riskLevels[documentToDelete.riskLevel] - 1
      },
      topKeyPoints: updateTopKeyPoints([], updatedHistory.flatMap(doc => doc.keyPoints))
    }));
  };

  const renderDocumentInput = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold">Document Input</h2>
      </div>

      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              Drop your PDF here or click to upload
            </span>
            <span className="text-xs text-gray-500">
              {pdfFile ? `Selected: ${pdfFile.name}` : 'PDF files only'}
            </span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Or paste your text directly:</h3>
        <textarea
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          className="w-full h-48 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Paste your legal document here..."
        />
      </div>

      <button
        onClick={analyzeDocument}
        disabled={!document && !pdfFile}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Analyze Document
      </button>
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Document History</h2>
        </div>
      </div>
      <div className="space-y-4">
        {documentHistory.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3">
              {doc.type === 'pdf' ? (
                <FileText className="h-5 w-5 text-blue-500" />
              ) : (
                <FileText className="h-5 w-5 text-gray-500" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">{doc.title}</h3>
                <p className="text-sm text-gray-500">Analyzed on {new Date(doc.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${doc.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                  doc.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'}`}>
                {doc.riskLevel.charAt(0).toUpperCase() + doc.riskLevel.slice(1)}
              </span>
              <button
                onClick={() => handleDeleteDocument(doc.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold">Weekly Analytics</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-blue-900">Documents Analyzed</h3>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">{weeklyAnalytics.documentsAnalyzed}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-green-900">Low Risk</h3>
            <Shield className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-700 mt-2">{weeklyAnalytics.riskLevels.low}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-red-900">High Risk</h3>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-700 mt-2">{weeklyAnalytics.riskLevels.high}</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Most Common Key Points</h3>
        </div>
        <ul className="space-y-2">
          {weeklyAnalytics.topKeyPoints.map((point, index) => (
            <li key={index} className="flex items-center space-x-2 text-gray-700">
              <Check className="h-4 w-4 text-green-500" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Legal Document Analyzer</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <AlertTriangle className="h-4 w-4" />
            <span>AI-Assisted Analysis • Use with Professional Guidance</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
              ${activeTab === 'input' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'}`}
          >
            New Analysis
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
              ${activeTab === 'history' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'}`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
              ${activeTab === 'analytics' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'}`}
          >
            Analytics
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          {activeTab === 'input' && renderDocumentInput()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'analytics' && renderAnalytics()}

          {/* Right Column - Analysis Results */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Check className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Analysis Results</h2>
            </div>
            
            {analysis ? (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Risk Level Assessment</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    ${analysis.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                      analysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                    {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Key Points</h3>
                  <ul className="space-y-2">
                    {analysis.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Ethical Considerations</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-blue-900">
                    {analysis.ethicalConsiderations.map((consideration, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="select-none">•</span>
                        <span>{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Enter a document or upload a PDF to see analysis results</p>
              </div>
            )}
          </div>
        </div>

        {/* Ethics Footer */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-2">Our Ethical Commitment:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>We prioritize transparency in our AI analysis process</li>
            <li>Results are provided as assistance, not definitive legal advice</li>
            <li>We maintain strict data privacy and security standards</li>
            <li>Our system is regularly audited for bias and fairness</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
