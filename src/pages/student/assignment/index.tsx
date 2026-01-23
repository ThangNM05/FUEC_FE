import { ArrowLeft, Upload, FileText, CheckCircle, Download, X, File } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';

function AssignmentDetails() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const assignment = {
    title: 'Assignment 2: Design Patterns',
    course: 'Software Engineering',
    dueDate: '2024-05-17',
    description: 'Implement at least 3 design patterns (Singleton, Factory, Observer) in a practical project. Document your implementation with UML diagrams and explanations.',
    submitted: false,
    maxScore: 100,
    attachments: [
      { name: 'assignment_requirements.pdf', size: '2.4 MB' },
      { name: 'sample_code.zip', size: '1.2 MB' }
    ]
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      alert(`Submitting: ${selectedFile.name}`);
      navigate('/student/course-details');
    }
  };

  return (
    <div className="p-4 md:p-6 animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/student/course-details')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#0A1B3C] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">{assignment.title}</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">{assignment.course}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg font-bold text-[#0A1B3C] mb-4">Assignment Description</h2>
            <p className="text-gray-700 leading-relaxed">{assignment.description}</p>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg font-bold text-[#0A1B3C] mb-4">Attachments</h2>
            <div className="space-y-3">
              {assignment.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0A1B3C] text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submission */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg font-bold text-[#0A1B3C] mb-4">Your Submission</h2>

            {!assignment.submitted ? (
              <>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <File className="w-8 h-8 text-orange-500" />
                      <div className="text-left">
                        <p className="font-medium text-[#0A1B3C]">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">Drag and drop your file here, or</p>
                      <label className="inline-block px-4 py-2 bg-[#F37022] text-white rounded-lg font-medium cursor-pointer hover:bg-[#D96419]">
                        Browse Files
                        <input type="file" className="hidden" onChange={handleFileChange} />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Max file size: 10MB. Accepted: .pdf, .zip, .doc, .docx</p>
                    </>
                  )}
                </div>
                <button
                  className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${selectedFile
                      ? 'bg-[#F37022] text-white hover:bg-[#D96419]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  onClick={handleSubmit}
                  disabled={!selectedFile}
                >
                  <Upload className="w-4 h-4" /> Submit Assignment
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-semibold text-green-700">Assignment Submitted</p>
                  <p className="text-sm text-green-600">Submitted on May 10, 2024 at 11:30 AM</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg font-bold text-[#0A1B3C] mb-4">Assignment Info</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">Due Date</span>
                <p className="font-semibold text-red-600">{assignment.dueDate}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Max Score</span>
                <p className="font-semibold text-[#0A1B3C]">{assignment.maxScore} points</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status</span>
                <p className={`font-semibold ${assignment.submitted ? 'text-green-600' : 'text-orange-600'}`}>
                  {assignment.submitted ? 'Submitted' : 'Not Submitted'}
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 md:p-6">
            <h2 className="text-lg font-bold text-blue-900 mb-3">Tips</h2>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Include all required files in a single ZIP</li>
              <li>• Add comments to your code</li>
              <li>• Include UML diagrams as PDF</li>
              <li>• Test your code before submission</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignmentDetails;
