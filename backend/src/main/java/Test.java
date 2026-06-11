import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.TimeZone;
public class Test {
    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        System.out.println("Without formatter tz: " + formatter.format(cld.getTime()));
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        System.out.println("With formatter tz: " + formatter.format(cld.getTime()));
    }
}
