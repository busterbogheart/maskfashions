package app.maskfashions;

import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  @Override
  public void invokeDefaultOnBackPressed() {
    moveTaskToBack(true);
  }

  @Override
  protected String getMainComponentName() {
    return "maskfashions";
  }

  private RNTDeepAR deepArView;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

//    getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
  }

  @Override
  protected void onStart() {
    super.onStart();
    if (this.deepArView != null) {
      this.deepArView.onStart();
    }
  }

  @Override
  protected void onStop() {
    super.onStop();
    if (this.deepArView != null) {
      this.deepArView.onStop();
    }
  }

  @Override
  protected void onDestroy() {
    super.onDestroy();
    this.deepArView = null;
  }

  public void setDeepArView(RNTDeepAR view) {
    this.deepArView = view;
  }

}
