import React from "react";
import {
  X,
  User,
  Calendar,
  Star,
  Target,
  TrendingUp,
  FileText,
  Flag,
} from "lucide-react";
import { useGetPlayerAssessmentByIdQuery } from "../../store/api/apiSlice";
import type { SkillAssessment, PlayerGoal } from "../../store/api/apiSlice";

interface PlayerAssessmentDetailsProps {
  assessmentId: string;
  onClose: () => void;
}

const PlayerAssessmentDetails: React.FC<PlayerAssessmentDetailsProps> = ({
  assessmentId,
  onClose,
}) => {
  const { data: assessment, isLoading } =
    useGetPlayerAssessmentByIdQuery(assessmentId);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="text-center">Loading assessment details...</div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="text-center text-red-600">Assessment not found</div>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-600";
    if (rating >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingBgColor = (rating: number) => {
    if (rating >= 8) return "bg-green-100";
    if (rating >= 6) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Player Assessment
            </h2>
            <p className="text-gray-600">
              {assessment.playerName} - {assessment.playerPosition}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Assessment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Assessment Date</p>
                <p className="font-medium">
                  {new Date(assessment.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium">{assessment.type}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Star className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Overall Rating</p>
                <p
                  className={`text-xl font-bold ${getRatingColor(
                    assessment.overallRating
                  )}`}
                >
                  {assessment.overallRating}/10
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Player Position</p>
                <p className="font-medium">{assessment.playerPosition}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Skills Assessment */}
              {assessment.skills && assessment.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Skills Assessment
                  </h3>
                  <div className="space-y-3">
                    {assessment.skills.map(
                      (skill: SkillAssessment, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {skill.skill}
                            </p>
                            {skill.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                {skill.notes}
                              </p>
                            )}
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingBgColor(
                              skill.rating
                            )}`}
                          >
                            <span className={getRatingColor(skill.rating)}>
                              {skill.rating}/10
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Physical Metrics */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Physical Metrics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(assessment.physicalMetrics).map(
                    ([metric, value]: [string, number | undefined]) =>
                      value !== undefined && (
                        <div
                          key={metric}
                          className="p-3 border border-gray-200 rounded-lg"
                        >
                          <p className="text-sm text-gray-600 capitalize">
                            {metric}
                          </p>
                          <p
                            className={`text-lg font-medium ${getRatingColor(
                              value
                            )}`}
                          >
                            {value}/10
                          </p>
                        </div>
                      )
                  )}
                </div>
              </div>

              {/* Mental Attributes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Mental Attributes
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(assessment.mentalAttributes).map(
                    ([attribute, value]: [string, number | undefined]) =>
                      value !== undefined && (
                        <div
                          key={attribute}
                          className="p-3 border border-gray-200 rounded-lg"
                        >
                          <p className="text-sm text-gray-600 capitalize">
                            {attribute}
                          </p>
                          <p
                            className={`text-lg font-medium ${getRatingColor(
                              value
                            )}`}
                          >
                            {value}/10
                          </p>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Strengths */}
              {assessment.strengths && assessment.strengths.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-green-700 mb-3">
                    Strengths
                  </h3>
                  <div className="space-y-2">
                    {assessment.strengths.map(
                      (strength: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{strength}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Areas for Improvement */}
              {assessment.areasForImprovement &&
                assessment.areasForImprovement.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-yellow-700 mb-3">
                      Areas for Improvement
                    </h3>
                    <div className="space-y-2">
                      {assessment.areasForImprovement.map(
                        (area: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{area}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Recommendations */}
              {assessment.recommendations &&
                assessment.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-blue-700 mb-3">
                      Recommendations
                    </h3>
                    <div className="space-y-2">
                      {assessment.recommendations.map(
                        (recommendation: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">
                              {recommendation}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Development Goals */}
          {assessment.goals && assessment.goals.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Development Goals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessment.goals.map((goal: PlayerGoal, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {goal.description}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getGoalStatusColor(
                          goal.status
                        )}`}
                      >
                        {goal.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Date:</span>
                        <span className="text-gray-900">
                          {new Date(goal.targetDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Progress:</span>
                        <span className="text-gray-900">{goal.progress}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-sport-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {assessment.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Additional Notes
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {assessment.notes}
                </p>
              </div>
            </div>
          )}

          {/* Assessment Timeline */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Assessment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">
                  {new Date(assessment.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Assessment Date:</span>
                <span className="text-gray-900">
                  {new Date(assessment.date).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-900">
                  {new Date(assessment.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Edit Assessment
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerAssessmentDetails;
