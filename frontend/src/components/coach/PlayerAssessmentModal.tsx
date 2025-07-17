import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useCreatePlayerAssessmentMutation } from "../../store/api/apiSlice";
import type {
  CreatePlayerAssessmentRequest,
  SkillAssessment,
  User,
  PlayerGoal,
} from "../../store/api/apiSlice";

interface PlayerAssessmentModalProps {
  onClose: () => void;
  players: User[];
  coachId: string;
}

const PlayerAssessmentModal: React.FC<PlayerAssessmentModalProps> = ({
  onClose,
  players,
  coachId,
}) => {
  const [createPlayerAssessment, { isLoading }] =
    useCreatePlayerAssessmentMutation();

  const [formData, setFormData] = useState<CreatePlayerAssessmentRequest>({
    coachId,
    playerId: "",
    type: "Training",
    skills: [],
    physicalMetrics: {},
    mentalAttributes: {},
    overallRating: 5,
    strengths: [""],
    areasForImprovement: [""],
    recommendations: [""],
    notes: "",
    goals: [],
  });

  const [newSkill, setNewSkill] = useState<Omit<SkillAssessment, "id">>({
    skill: "",
    rating: 5,
    notes: "",
  });

  const [newGoal, setNewGoal] = useState<Omit<PlayerGoal, "id">>({
    description: "",
    targetDate: "",
    status: "Not Started",
    progress: 0,
  });

  const skillCategories = [
    "Ball Control",
    "Passing",
    "Shooting",
    "Dribbling",
    "Crossing",
    "Heading",
    "Tackling",
    "Positioning",
    "Decision Making",
    "Communication",
    "Leadership",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Clean up arrays by removing empty values
      const cleanedStrengths = formData.strengths.filter(
        (s) => s.trim() !== ""
      );
      const cleanedImprovements = formData.areasForImprovement.filter(
        (a) => a.trim() !== ""
      );
      const cleanedRecommendations = formData.recommendations.filter(
        (r) => r.trim() !== ""
      );

      await createPlayerAssessment({
        ...formData,
        strengths: cleanedStrengths,
        areasForImprovement: cleanedImprovements,
        recommendations: cleanedRecommendations,
      }).unwrap();

      onClose();
    } catch (error) {
      console.error("Failed to create player assessment:", error);
    }
  };

  const selectedPlayer = players.find((p) => p.id === formData.playerId);

  const addSkill = () => {
    if (newSkill.skill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill],
      }));
      setNewSkill({ skill: "", rating: 5, notes: "" });
    }
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addGoal = () => {
    if (newGoal.description.trim()) {
      setFormData((prev) => ({
        ...prev,
        goals: [...prev.goals, newGoal],
      }));
      setNewGoal({
        description: "",
        targetDate: "",
        status: "Not Started",
        progress: 0,
      });
    }
  };

  const removeGoal = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));
  };

  const addArrayItem = (
    field: "strengths" | "areasForImprovement" | "recommendations"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const updateArrayItem = (
    field: "strengths" | "areasForImprovement" | "recommendations",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeArrayItem = (
    field: "strengths" | "areasForImprovement" | "recommendations",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Player Assessment
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
                Select Player *
              </label>
              <select
                required
                value={formData.playerId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, playerId: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
              >
                <option value="">Select a player...</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} - {player.playerData?.position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Type *
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
                <option value="Training">Training</option>
                <option value="Match">Match</option>
                <option value="Fitness Test">Fitness Test</option>
                <option value="Individual Assessment">
                  Individual Assessment
                </option>
              </select>
            </div>
          </div>

          {selectedPlayer && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                Player Information
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>{" "}
                  {selectedPlayer.name}
                </div>
                <div>
                  <span className="text-gray-600">Position:</span>{" "}
                  {selectedPlayer.playerData?.position}
                </div>
                <div>
                  <span className="text-gray-600">Age:</span>{" "}
                  {selectedPlayer.playerData?.age}
                </div>
              </div>
            </div>
          )}

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating (1-10) *
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.overallRating}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  overallRating: parseInt(e.target.value),
                }))
              }
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Poor (1)</span>
              <span className="font-medium text-lg text-gray-900">
                {formData.overallRating}
              </span>
              <span>Excellent (10)</span>
            </div>
          </div>

          {/* Skills Assessment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills Assessment
            </label>

            {/* Existing Skills */}
            {formData.skills.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-900 flex-1">
                      {skill.skill}
                    </span>
                    <span className="text-gray-600">
                      Rating: {skill.rating}/10
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Skill */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">
                Add Skill Assessment
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skill
                  </label>
                  <select
                    value={newSkill.skill}
                    onChange={(e) =>
                      setNewSkill((prev) => ({
                        ...prev,
                        skill: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
                  >
                    <option value="">Select skill...</option>
                    {skillCategories.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newSkill.rating}
                    onChange={(e) =>
                      setNewSkill((prev) => ({
                        ...prev,
                        rating: parseInt(e.target.value),
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addSkill}
                    disabled={!newSkill.skill}
                    className="w-full bg-sport-600 text-white px-4 py-2 rounded-md hover:bg-sport-700 disabled:bg-gray-300"
                  >
                    Add Skill
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={newSkill.notes}
                  onChange={(e) =>
                    setNewSkill((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
                  placeholder="Additional notes about this skill..."
                />
              </div>
            </div>
          </div>

          {/* Physical Metrics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Physical Metrics (1-10)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "speed",
                "agility",
                "strength",
                "endurance",
                "flexibility",
                "coordination",
              ].map((metric) => (
                <div key={metric}>
                  <label className="block text-sm text-gray-600 mb-1 capitalize">
                    {metric}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={
                      formData.physicalMetrics[
                        metric as keyof typeof formData.physicalMetrics
                      ] || ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        physicalMetrics: {
                          ...prev.physicalMetrics,
                          [metric]: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        },
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mental Attributes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mental Attributes (1-10)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "concentration",
                "confidence",
                "motivation",
                "coachability",
                "leadership",
                "teamwork",
              ].map((attribute) => (
                <div key={attribute}>
                  <label className="block text-sm text-gray-600 mb-1 capitalize">
                    {attribute}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={
                      formData.mentalAttributes[
                        attribute as keyof typeof formData.mentalAttributes
                      ] || ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        mentalAttributes: {
                          ...prev.mentalAttributes,
                          [attribute]: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        },
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Strengths, Areas for Improvement, Recommendations */}
          {(
            ["strengths", "areasForImprovement", "recommendations"] as const
          ).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {field === "areasForImprovement"
                  ? "Areas for Improvement"
                  : field}
              </label>
              <div className="space-y-2">
                {formData[field].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        updateArrayItem(field, index, e.target.value)
                      }
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
                      placeholder={`Add ${
                        field === "areasForImprovement"
                          ? "area for improvement"
                          : field.slice(0, -1)
                      }...`}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(field, index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(field)}
                  className="flex items-center gap-2 text-sport-600 hover:text-sport-700"
                >
                  <Plus className="w-4 h-4" />
                  Add{" "}
                  {field === "areasForImprovement"
                    ? "Area for Improvement"
                    : field.slice(0, -1)}
                </button>
              </div>
            </div>
          ))}

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Development Goals
            </label>

            {/* Existing Goals */}
            {formData.goals.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.goals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {goal.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        Target: {goal.targetDate} | Status: {goal.status}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGoal(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Goal */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">
                Add Development Goal
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Description
                  </label>
                  <input
                    type="text"
                    value={newGoal.description}
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
                    placeholder="e.g., Improve passing accuracy to 85%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        targetDate: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addGoal}
                disabled={!newGoal.description.trim()}
                className="bg-sport-600 text-white px-4 py-2 rounded-md hover:bg-sport-700 disabled:bg-gray-300"
              >
                Add Goal
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sport-500"
              placeholder="Any additional observations, comments, or feedback..."
            />
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
              disabled={isLoading || !formData.playerId}
              className="bg-sport-600 text-white px-6 py-2 rounded-md hover:bg-sport-700 disabled:bg-sport-400"
            >
              {isLoading ? "Saving..." : "Save Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerAssessmentModal;
