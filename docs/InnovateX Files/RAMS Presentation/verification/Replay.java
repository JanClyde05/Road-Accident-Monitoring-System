import android.content.Context;
import com.example.ai.SensorAiInferenceEngine;
import com.example.model.FeatureVector;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Arrays;
import kotlin.coroutines.EmptyCoroutineContext;

/** Runs the compiled Android classifier against feature rows supplied by replay.py. */
public class Replay {
    public static void main(String[] args) throws Exception {
        var engine = new SensorAiInferenceEngine(new Context(), () -> EmptyCoroutineContext.INSTANCE);
        var input = new BufferedReader(new InputStreamReader(System.in));
        for (String line; (line = input.readLine()) != null;) {
            var columns = line.split("\t");
            float[] f = new float[14];
            for (int i = 0; i < f.length; i++) {
                f[i] = Float.parseFloat(columns[i + 3]);
            }
            var vector = new FeatureVector(0L, "", 0, 0L, 1000L,
                    f[0], f[1], f[2], f[3], f[4], f[5], f[6],
                    f[7], f[8], f[9], f[10], f[11], f[12], f[13]);
            var result = engine.runTier1Inference(vector, System.currentTimeMillis(), Float.parseFloat(columns[2]));
            var profile = result.getMotionProfile();
            System.out.println(String.join("\t", Arrays.asList(
                    columns[0], columns[1], profile.isAccident() ? "1" : "0", profile.name())));
        }
    }
}
