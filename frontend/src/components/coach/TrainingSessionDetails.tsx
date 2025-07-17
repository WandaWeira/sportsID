import React from "react";
import { X, Clock, MapPin, Users, Target, CheckCircle } from "lucide-react";
import { useGetTrainingSessionByIdQuery } from "../../store/api/apiSlice";
import type { TrainingExercise } from "../../store/api/apiSlice";

interface TrainingSessionDetailsProps {
  sessionId: string;
  onClose: () => void;
}

const TrainingSessionDetails: React.FC<TrainingSessionDetailsProps> = ({
  sessionId,
  onClose,
}) => {
  const { data: session, isLoading } =
    useGetTrainingSessionByIdQuery(sessionId);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="text-center">Loading session details...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="text-center text-red-600">Session not found</div>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {session.title}
            </h2>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(
                session.status
              )}`}
            >
              {session.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Session Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{session.duration} minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{session.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Participants</p>
                <p className="font-medium">
                  {session.participants?.length || 0}/{session.maxParticipants}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Target className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium">{session.type}</p>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Description */}
              {session.description && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700">{session.description}</p>
                </div>
              )}

              {/* Objectives */}
              {session.objectives && session.objectives.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Session Objectives
                  </h3>
                  <div className="space-y-2">
                    {session.objectives.map(
                      (objective: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{objective}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {session.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Notes
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700">{session.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Training Exercises */}
              {session.exercises && session.exercises.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Training Exercises
                  </h3>
                  <div className="space-y-4">
                    {session.exercises.map(
                      (exercise: TrainingExercise, index: number) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {exercise.name}
                            </h4>
                            <span className="text-sm text-gray-600">
                              {exercise.duration} min
                            </span>
                          </div>

                          {exercise.description && (
                            <p className="text-gray-700 text-sm mb-3">
                              {exercise.description}
                            </p>
                          )}

                          {exercise.objectives &&
                            exercise.objectives.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Objectives:
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {exercise.objectives.map(
                                    (obj: string, objIndex: number) => (
                                      <li
                                        key={objIndex}
                                        className="flex items-start gap-2"
                                      >
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                        {obj}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                          {exercise.equipment &&
                            exercise.equipment.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Equipment:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {exercise.equipment.map(
                                    (equipment: string, eqIndex: number) => (
                                      <span
                                        key={eqIndex}
                                        className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                                      >
                                        {equipment}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {exercise.notes && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600 italic">
                                {exercise.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Session Timeline */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Session Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">
                      {new Date(session.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Scheduled Date:</span>
                    <span className="text-gray-900">
                      {new Date(session.date).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-900">
                      {new Date(session.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Participants Section */}
          {session.participants && session.participants.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Participants ({session.participants.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {session.participants.map(
                  (participantId: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-gray-900">
                        Player {participantId}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            {session.status === "Scheduled" && (
              <>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Edit Session
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Start Session
                </button>
              </>
            )}
            {session.status === "In Progress" && (
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Complete Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingSessionDetails;
