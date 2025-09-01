import React, { useState, useEffect, useContext } from 'react';
import { predictionsAPI, insightsAPI } from '../services/api';
import { toast } from 'react-toastify';

const Insights = () => {
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [historicalPredictions, setHistoricalPredictions] = useState(null);
  const [insights, setInsights] = useState(null);
  const [sevenDayPlan, setSevenDayPlan] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {

    setLoading(true);
    setError(null);

    try {
      const [
        currentPredResponse,
        historicalPredResponse,
        insightsResponse,
        sevenDayPlanResponse,
        modelStatusResponse,
      ] = await Promise.all([
        predictionsAPI.getCurrentPrediction(),
        predictionsAPI.getPredictionHistory(),
        insightsAPI.getInsights(),
        predictionsAPI.get7DayPlan(),
        predictionsAPI.getModelStatus(),
      ]);

      setCurrentPrediction(currentPredResponse.data);
      setHistoricalPredictions(historicalPredResponse.data);
      setInsights(insightsResponse.data);
      setSevenDayPlan(sevenDayPlanResponse.data);
      setModelStatus(modelStatusResponse.data);

      toast.success("Insights data loaded successfully!");
    } catch (err) {
      console.error("Failed to fetch insights data:", err);
      setError("Failed to load insights data. Please try again later.");
      toast.error("Failed to load insights data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Fetch data only once on component mount

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="container mx-auto p-4 bg-black-950 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-center text-lavender-600">Your Cycle Insights & Predictions</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={handleRefresh}
          className="bg-lavender-500 hover:bg-lavender-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
        >
          Refresh Data
        </button>
      </div>

      {loading && (
        <div className="text-center text-gray-600 text-lg">Loading your personalized insights...</div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-center font-semibold text-lg" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <p className="mt-2 text-sm">This often happens if there isn't enough data to generate predictions. Please log more moods and periods!</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Current Cycle Prediction */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-lavender-200">
            <h2 className="text-xl font-semibold mb-4 text-lavender-500">Current Cycle Prediction</h2>
            {currentPrediction ? (
              <div>
                <p className="text-gray-700">
                  <span className="font-medium">Predicted Start:</span> {currentPrediction.predicted_start_date || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Predicted End:</span> {currentPrediction.predicted_end_date || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Cycle Length:</span> {currentPrediction.predicted_cycle_length ? `${currentPrediction.predicted_cycle_length} days` : 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Fertile Window:</span> {currentPrediction.fertile_window_start || 'N/A'} to {currentPrediction.fertile_window_end || 'N/A'}
                </p>
                {/* Placeholder for a simple visualization */}
                <div className="mt-4 bg-lavender-50 p-3 rounded-md text-sm text-lavender-700">
                  <p>Visual representation of your current cycle (e.g., a timeline or calendar view) would go here.</p>
                  {/* Consider using a charting library like Chart.js or Recharts for better visualization */}
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No current prediction available.</p>
            )}
          </div>

          {/* 7-Day Forecast */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-lavender-200">
            <h2 className="text-xl font-semibold mb-4 text-lavender-500">7-Day Forecast</h2>
            {sevenDayPlan && sevenDayPlan.forecast && sevenDayPlan.forecast.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-700">
                {sevenDayPlan.forecast.map((day, index) => (
                  <li key={index} className="mb-2">
                    <span className="font-medium">{day.date}:</span> {day.prediction || 'No specific prediction'}
                    {day.mood_prediction && ` (Mood: ${day.mood_prediction})`}
                    {day.symptom_prediction && ` (Symptoms: ${day.symptom_prediction})`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No 7-day forecast available.</p>
            )}
          </div>

          {/* Model Status */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-lavender-200">
            <h2 className="text-xl font-semibold mb-4 text-lavender-500">ML Model Status</h2>
            {modelStatus ? (
              <div>
                <p className="text-gray-700">
                  <span className="font-medium">Status:</span> {modelStatus.status || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Last Trained:</span> {modelStatus.last_trained || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Accuracy:</span> {modelStatus.accuracy ? `${(modelStatus.accuracy * 100).toFixed(2)}%` : 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Next Training:</span> {modelStatus.next_training || 'N/A'}
                </p>
                {/* Placeholder for model performance visualization */}
                <div className="mt-4 bg-lavender-50 p-3 rounded-md text-sm text-lavender-700">
                  <p>Visuals for model accuracy and training history would enhance this section.</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Model status not available.</p>
            )}
          </div>

          {/* Historical Trends Chart */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-lavender-200 md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4 text-lavender-500">Historical Cycle Trends</h2>
            {historicalPredictions && historicalPredictions.history && historicalPredictions.history.length > 0 ? (
              <div>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Average Cycle Length:</span> {historicalPredictions.average_cycle_length ? `${historicalPredictions.average_cycle_length.toFixed(2)} days` : 'N/A'}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Average Period Length:</span> {historicalPredictions.average_period_length ? `${historicalPredictions.average_period_length.toFixed(2)} days` : 'N/A'}
                </p>
                <h3 className="text-lg font-medium mt-4 mb-2">Past Cycles:</h3>
                <ul className="list-disc pl-5 text-gray-700 max-h-60 overflow-y-auto">
                  {historicalPredictions.history.map((cycle, index) => (
                    <li key={index} className="mb-1">
                      Cycle {index + 1}: {cycle.start_date} to {cycle.end_date} (Length: {cycle.cycle_length} days)
                    </li>
                  ))}
                </ul>
                {/* Placeholder for a proper chart */}
                <div className="mt-4 bg-lavender-50 p-3 rounded-md text-sm text-lavender-700">
                  <p>A line chart showing cycle lengths over time, or a bar chart for period lengths, would be very useful here.</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No historical prediction data available.</p>
            )}
          </div>

          {/* Analytics and Trends */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-lavender-200 md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4 text-lavender-500">Analytics & Pattern Recognition</h2>
            {insights ? (
              <div>
                <p className="text-gray-700">
                  <span className="font-medium">Key Insights:</span> {insights.key_insights || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Symptom Patterns:</span> {insights.symptom_patterns || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Mood Correlations:</span> {insights.mood_correlations || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Health Recommendations:</span> {insights.health_recommendations || 'N/A'}
                </p>
                {/* Placeholder for more advanced analytics visualization */}
                <div className="mt-4 bg-lavender-50 p-3 rounded-md text-sm text-lavender-700">
                  <p>This section could benefit from advanced dashboards, heatmaps for symptoms, or mood trend graphs.</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No detailed analytics available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;