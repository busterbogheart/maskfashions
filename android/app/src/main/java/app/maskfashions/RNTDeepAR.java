package app.maskfashions;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.ContextWrapper;
import android.content.DialogInterface;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.hardware.Camera;
import android.media.Image;
import android.os.Environment;
import android.text.format.DateFormat;
import android.util.AttributeSet;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.lifecycle.LifecycleObserver;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Date;

import ai.deepar.ar.ARErrorType;
import ai.deepar.ar.AREventListener;
import ai.deepar.ar.CameraResolutionPreset;
import ai.deepar.ar.DeepAR;
import cz.msebera.android.httpclient.Header;

public class RNTDeepAR extends FrameLayout implements AREventListener, SurfaceHolder.Callback, LifecycleObserver {

    private static final String TAG = "RNTDeepAR";
    public static final String LOG = "DEEPAR";
    private DeepAR deepAr;
    private CameraGrabber cameraGrabber;
    private int defaultCameraDevice = Camera.CameraInfo.CAMERA_FACING_FRONT;
    private int cameraDevice = defaultCameraDevice;
    SurfaceView surface;
    String tempVideoPath;

    private boolean started;

  /***
   * Each processed frame will be available here as an Image object. Make sure to call startCapture on
   * DeepAR object otherwise this method will not be called.
   */
  @Override
  public void frameAvailable(Image image) {

  }

  /***
   * Called when an error occurs - like the model path not found or the effect file failed to load.
   */
  @Override
  public void error(ARErrorType arErrorType, String s) {
    //TODO: implement error handling
    Log.e(RNTDeepAR.LOG, s);
  }

  public RNTDeepAR(Context context) {
        super(context);
        init();
    }

    public RNTDeepAR(@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }


    public RNTDeepAR(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        init();
    }


    private void init() {
        Log.i(RNTDeepAR.LOG, "DEEPAR INIT");
        View view = inflate(getContext(), R.layout.deeparview, null);
        addView(view);

        deepAr = new DeepAR(getContext());
        deepAr.setLicenseKey("fb5b518b5f4fd9e77cb4304abd18c01bb3a5a933fd2ff1c73be5904290d215129a7333eea0d8f49a");
        deepAr.initialize(this.getContext(), this);
        setupDeepAR();

        if (getActivity() instanceof MainActivity) {
            MainActivity ma = (MainActivity)getActivity();
            ma.setDeepArView(this);
        }
    }


    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
//        deepAr.setAREventListener(null);
//        deepAr.release();
//        deepAr = null;
    }


    public void onStart() {
        // We assume all permissions have been requested in the RN part
        setupDeepAR();
    }

    public void onStop() {
        if (!started) {
            return;
        }
        cameraGrabber.setFrameReceiver(null);
        cameraGrabber.stopPreview();
        cameraGrabber.releaseCamera();
        cameraGrabber = null;

        started = false;
    }


    private void setupDeepAR() {
        if (started) {
            Log.i(RNTDeepAR.LOG, "setupdeepar() already started");
            return;
        }

        started = true;

        surface = findViewById(R.id.surface);
        surface.getHolder().addCallback(this);

        // Surface might already be initialized, so we force the call to onSurfaceChanged
        surface.setVisibility(View.GONE);
        surface.setVisibility(View.VISIBLE);

        cameraGrabber = new CameraGrabber(cameraDevice);
        cameraGrabber.setScreenOrientation(0); // PORTRAIT

        cameraGrabber.setResolutionPreset(CameraResolutionPreset.P1280x720);

        final Activity context = getActivity();
        cameraGrabber.initCamera(new CameraGrabberListener() {
            @Override
            public void onCameraInitialized() {
                Log.i(RNTDeepAR.LOG, " { oncamerainitialized");
                cameraGrabber.setFrameReceiver(deepAr);
                cameraGrabber.startPreview();
                Log.i(RNTDeepAR.LOG, " } oncamerainitialized");
            }

            @Override
            public void onCameraError(String errorMsg) {
                Log.e(RNTDeepAR.LOG, "camera error: "+errorMsg);

                AlertDialog.Builder builder = new AlertDialog.Builder(context);
                builder.setTitle("Camera error");
                builder.setMessage(errorMsg);
                builder.setCancelable(true);
                builder.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                        dialogInterface.cancel();
                    }
                });
                AlertDialog dialog = builder.create();
                dialog.show();
            }
        });


    }

    private Activity getActivity() {
        Context context = getContext();
        while (context instanceof ContextWrapper) {
            if (context instanceof Activity) {
              return (Activity)context;
            }
            context = ((ContextWrapper)context).getBaseContext();
        }
        return null;
    }

    public void switchCamera() {
        if (cameraGrabber != null) {

            pause();

            cameraDevice = cameraGrabber.getCurrCameraDevice() == Camera.CameraInfo.CAMERA_FACING_FRONT ? Camera.CameraInfo.CAMERA_FACING_BACK : Camera.CameraInfo.CAMERA_FACING_FRONT;
            cameraGrabber.changeCameraDevice(cameraDevice, cameraDevice -> {

                cameraGrabber.setFrameReceiver(deepAr);
                cameraGrabber.startPreview();

                String value = cameraDevice == Camera.CameraInfo.CAMERA_FACING_FRONT ? "front" : "back";
                sendEvent("cameraSwitch", value, null);

                resume();
            });

        }
    }


    public void switchEffect(String effectName, String slot){
        if (deepAr == null) {
            return;
        }

        if(slot == null || slot.isEmpty()) {
            slot = "effect";
        }

        String effect = null;
        if (!effectName.isEmpty() && !effectName.equalsIgnoreCase("me") && !effectName.equalsIgnoreCase("none")) {
            effect = "file:///android_asset/effects/" + effectName;
            deepAr.switchEffect(slot, effect);
        } else {
            deepAr.switchEffect(slot, "", 0);
        }
    }

    public void setFlashOn(boolean isFlashOn) {

    }

    public void pause() {
        if (deepAr == null) {
            return;
        }

        deepAr.setPaused(true);
    }

    public void resume() {
        if (deepAr == null) {
            return;
        }

        deepAr.setPaused(false);
    }

    public void takeScreenshot() {
        if (deepAr == null) {
            return;
        }

        new android.os.Handler().postDelayed(
            new Runnable() {
                public void run() {
                    deepAr.takeScreenshot();
                }
            }, 100);

    }

    public void startRecording() {

        if (deepAr == null) {
            return;
        }

        int recordingWidth = 720;

        if (recordingWidth > deepAr.getMaxSupportedVideoWidth()) {
            recordingWidth = deepAr.getMaxSupportedVideoWidth();
        }

        float aspectRatio = (float)deepAr.getRenderWidth() / deepAr.getRenderHeight();

        int recordingHeight = (int)(recordingWidth / aspectRatio);

        if (recordingHeight > deepAr.getMaxSupportedVideoHeight()) {
            recordingHeight = deepAr.getMaxSupportedVideoHeight();
            recordingWidth = (int)(recordingHeight*aspectRatio);
        }


        tempVideoPath = Environment.getExternalStorageDirectory().toString() + File.separator + "video.mp4";
        deepAr.startVideoRecording(tempVideoPath, recordingWidth, recordingHeight);
    }

    private void sendEvent(String key, String value, String value2) {
        final Context context = getContext();
        if (context instanceof ReactContext) {
            WritableMap event = new WritableNativeMap();
            event.putString("type", key);
            event.putString("value", value);
            if (value2 != null) {
                event.putString("value2", value2);
            }
            ((ReactContext) context).getJSModule(RCTEventEmitter.class)
                    .receiveEvent(getId(),
                            "onEventSent", event);


        }
    }

    public void finishRecording() {
        if (deepAr == null) {
            return;
        }
        deepAr.stopVideoRecording();
    }

    @Override
    public void screenshotTaken(Bitmap bitmap) {
        if (bitmap == null) { return; }
        String screenshotPath = saveToInternalStorage(bitmap);
        if (!screenshotPath.isEmpty()) {
            sendEvent("screenshotTaken", screenshotPath, null);
        }

    }

    @Override
    public void videoRecordingStarted() {

        sendEvent("didStartVideoRecording", "", null);
    }

    @Override
    public void videoRecordingFinished() {
        sendEvent("didFinishVideoRecording", tempVideoPath, null);
    }

    @Override
    public void videoRecordingFailed() {

    }

    @Override
    public void videoRecordingPrepared() {

    }

    @Override
    public void shutdownFinished() {

    }

    @Override
    public void initialized() {
        sendEvent("initialized", "", null);
    }

    @Override
    public void faceVisibilityChanged(boolean b) {
        sendEvent("faceVisibilityChanged", String.valueOf(b), "");
    }

    @Override
    public void imageVisibilityChanged(String gameObject, boolean visible) {
        sendEvent("imageVisibilityChanged", gameObject, visible ? "true" : "false");
    }

    public void error(String s) {

    }

    @Override
    public void effectSwitched(String s) {
      // this works

    }
    @Override
    public void surfaceCreated(SurfaceHolder holder) {

    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
        if (deepAr != null) {
            deepAr.setRenderSurface(holder.getSurface(), width, height);
        }
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        if (deepAr != null) {
            deepAr.setRenderSurface(null, 0, 0);
        }
    }

    private String saveToInternalStorage(Bitmap bitmapImage){

        ContextWrapper cw = new ContextWrapper(getContext().getApplicationContext());
        // path to /data/data/yourapp/app_data/imageDir
        File cacheDir = cw.getCacheDir();
        // Create imageDir
        CharSequence now = DateFormat.format("yyyy_MM_dd_hh_mm_ss", new Date());
        File tempPath=new File(cacheDir,"maskfashions_" + now +".jpg");
        if(!tempPath.exists()){
            try {
                tempPath.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }else{
            tempPath.delete();
            try {
                tempPath.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(tempPath);
            // Use the compress method on the BitMap object to write image to the OutputStream
            bitmapImage.compress(Bitmap.CompressFormat.JPEG, 70, fos);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                fos.flush();
                fos.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return tempPath.getAbsolutePath();
    }

    public void switchTexture(String textureUrl) throws Exception {
        ReactContext rc = (ReactContext) getContext();
        // /data/user/0/app.maskfashions/files + /textures
        // need more research on Android filesystem; whether this will change, etc
        // also how does caching and cache checking factor in
        String path = rc.getApplicationContext().getFilesDir().getAbsolutePath()+"/textures";
//        Bitmap bitmap = BitmapFactory.decodeFile(path);
//        deepAr.changeParameterTexture("mask-itself","MeshRenderer","s_texDiffuse", bitmap);
        AsyncHttpClient client = new AsyncHttpClient();
        client.get(textureUrl, new AsyncHttpResponseHandler() {
            @Override
            public void onSuccess(int statusCode, Header[] headers, byte[] responseBody) {
                if(statusCode == 200){
                  Bitmap bitmap = BitmapFactory.decodeByteArray(responseBody, 0, responseBody.length);
                    // 'parameter' varies based on shader's json
                  deepAr.changeParameterTexture("mask-itself","MeshRenderer",
                          "s_texDiffuse", bitmap);
                } else {
                    Log.e(RNTDeepAR.LOG,"error loading texture: "+textureUrl);
                }
            }

            @Override
            public void onFailure(int statusCode, Header[] headers, byte[] responseBody, Throwable error) {
                Log.e(RNTDeepAR.LOG,"switchTexture failed w "+String.valueOf(statusCode)+", err: "+error.toString());
            }
        });
    }
}
