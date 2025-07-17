import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useCreateTrainingSessionMutation } from "../../store/api/apiSlice";
import type {
  CreateTrainingSessionRequest,
  TrainingExercise,
} from "../../store/api/apiSlice";

interface TrainingSessionModalProps {
  onClose: () => void;
  coachId: string;
}

const TrainingSessionModal: React.FC<TrainingSessionModalProps> = ({
  onClose,
  coachId,
}) => {
  const [createTrainingSession, { isLoading }] =
    useCreateTrainingSessionMutation();

  const [formData, setFormData] = useState<CreateTrainingSessionRequest>({
    title: "",
    description: "",
    type: "Tactical",
    date: "",
    duration: 90,
    location: "",
    maxParticipants: 20,
    objectives: [""],
    exercises: [],
  });

  const [newExercise, setNewExercise] = useState<Omit<TrainingExercise, "id">>({
    name: "",
    description: "",
    duration: 15,
    objectives: [""],
    equipment: [""],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Filter out empty objectives and exercises
      const cleanedObjectives = formData.objectives.filter(
        (obj) => obj.trim() !== ""
      );
      const cleanedExercises = formData.exercises.map((exercise) => ({
        ...exercise,
        objectives: exercise.objectives.filter((obj) => obj.trim() !== ""),
        equipment: exercise.equipment.filter((eq) => eq.trim() !== ""),
      }));

      await createTrainingSession({
        coachId,
        ...formData,
        objectives: cleanedObjectives,
        exercises: cleanedExercises,
      }).unwrap();

      onClose();
    } catch (error) {
      console.error("Failed to create training session:", error);
    }
  };

  const addObjective = () => {
    setFormData((prev) => ({
      ...prev,
      objectives: [...prev.objectives, ""],
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => (i === index ? value : obj)),
    }));
  };

  const removeObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const addExercise = () => {
    if (newExercise.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        exercises: [...prev.exercises, newExercise],
      }));
      setNewExercise({
        name: "",
        description: "",
        duration: 15,
        objectives: [""],
        equipment: [""],
        notes: "",
      });
    }
  };

  const removeExercise = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const addExerciseObjective = () => {
    setNewExercise((prev) => ({
      ...prev,
      objectives: [...prev.objectives, ""],
    }));
  };

  const updateExerciseObjective = (index: number, value: string) => {
    setNewExercise((prev) => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => (i === index ? value : obj)),
    }));
  };

  const addExerciseEquipment = () => {
    setNewExercise((prev) => ({
      ...prev,
      equipment: [...prev.equipment, ""],
    }));
  };

  const updateExerciseEquipment = (index: number, value: string) => {
    setNewExercise((prev) => ({
      ...prev,
      equipment: prev.equipment.map((eq, i) => (i === index ? value : eq)),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Training Session
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
                placeholder="e.g., Tactical Training - Possession Play"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as any,
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
              >
                <option value="Tactical">Tactical</option>
                <option value="Technical">Technical</option>
                <option value="Physical">Physical</option>
                <option value="Mental">Mental</option>
                <option value="Match Preparation">Match Preparation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                required
                min="15"
                max="180"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value),
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
                placeholder="e.g., Training Ground Field A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Participants *
              </label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxParticipants: parseInt(e.target.value),
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
              placeholder="Brief description of the training session..."
            />
          </div>

          {/* Session Objectives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Objectives
            </label>
            <div className="space-y-2">
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
                    placeholder="e.g., Improve passing accuracy under pressure"
                  />
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addObjective}
                className="flex items-center gap-2 text-sport-600 hover:text-sport-700"
              >
                <Plus className="w-4 h-4" />
                Add Objective
              </button>
            </div>
          </div>

          {/* Training Exercises */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Training Exercises
            </label>

            {/* Existing Exercises */}
            {formData.exercises.length > 0 && (
              <div className="space-y-3 mb-4">
                {formData.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {exercise.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      {exercise.description}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Duration: {exercise.duration} minutes
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Exercise */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Add Exercise</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    value={newExercise.name}
                    onChange={(e) =>
                      setNewExercise((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
                    placeholder="e.g., 4v2 Possession Square"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newExercise.duration}
                    onChange={(e) =>
                      setNewExercise((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value),
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Description
                </label>
                <textarea
                  rows={2}
                  value={newExercise.description}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
                  placeholder="Describe how the exercise works..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exercise Objectives
                  </label>
                  <div className="space-y-2">
                    {newExercise.objectives.map((objective, index) => (
                      <input
                        key={index}
                        type="text"
                        value={objective}
                        onChange={(e) =>
                          updateExerciseObjective(index, e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sport-500"
                        placeholder="Exercise objective"
                      />
                    ))}
                    <button
                      type="button"
                      onClick={addExerciseObjective}
                      className="text-sm text-sport-600 hover:text-sport-700"
                    >
                      + Add Objective
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Needed
                  </label>
                  <div className="space-y-2">
                    {newExercise.equipment.map((equipment, index) => (
                      <input
                        key={index}
                        type="text"
                        value={equipment}
                        onChange={(e) =>
                          updateExerciseEquipment(index, e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sport-500"
                        placeholder="e.g., Cones, Balls"
                      />
                    ))}
                    <button
                      type="button"
                      onClick={addExerciseEquipment}
                      className="text-sm text-sport-600 hover:text-sport-700"
                    >
                      + Add Equipment
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={addExercise}
                disabled={!newExercise.name.trim()}
                className="bg-sport-600 text-white px-4 py-2 rounded-md hover:bg-sport-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Exercise
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-sport-600 text-white px-6 py-2 rounded-md hover:bg-sport-700 disabled:bg-sport-400"
            >
              {isLoading ? "Creating..." : "Create Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingSessionModal;
